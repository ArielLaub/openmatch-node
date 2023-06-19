import { IRunRequest, IMatch, IMatchProfile, ITicket } from 'openmatch-node/definitions';
import { startMatchFunctionService } from 'openmatch-node/services/matchfunction';
import QueryService from 'openmatch-node/stubs/query';
import { queryPools } from 'openmatch-node/helpers/querypool';

// the endpoint for the Open Match query service.
const queryServiceAddress = 'open-match-query.open-match.svc.cluster.local:50503';
// The number of tickets to fetch per pool per match.
const ticketsPerPoolPerMatch = 2; 
// The port for hosting the Match Function.
const serverPort = 50502; 
// Match maker name
const matchName = 'basic-matchfunction';

const queryClient = new QueryService(queryServiceAddress);

let count = 0;
function makeMatches(p: IMatchProfile, poolTickets: { [pool: string]: ITicket[] }): IMatch[] {
    const matches: IMatch[] = [];
    console.log(`Generating proposals for profile ${p.name}`);
    console.log(JSON.stringify(p, null, 2))
    while (true) {
        let insufficientTickets = false;
        const matchTickets: ITicket[] = [];
  
      for (const pool in poolTickets) {
        const tickets = poolTickets[pool];
  
        if (tickets.length < ticketsPerPoolPerMatch) {
          // This pool is completely drained out. Stop creating matches.
          insufficientTickets = true;
          break;
        }
  
        // Remove the Tickets from this pool and add to the match proposal.
        matchTickets.push(...tickets.slice(0, ticketsPerPoolPerMatch));
        poolTickets[pool] = tickets.slice(ticketsPerPoolPerMatch);
      }
  
      if (insufficientTickets) {
        break;
      }
  
      matches.push({
        match_id: `profile-${p.name}-time-${new Date().toISOString()}-${count}`,
        match_profile: p.name,
        match_function: matchName,
        tickets: matchTickets,
      });
  
      count++;
    }
  
    return matches;
}

async function run(req: IRunRequest): Promise<IMatch[]> {
    // Fetch tickets for the pools specified in the Match Profile.
    console.log(`Generating proposals for function ${req.profile.name}`)
    let poolTickets: Record<string, ITicket[]>;
    try {
        poolTickets = await queryPools(queryClient, req.profile.pools);
    } catch (err) {
        console.log(`Failed to query tickets for the given pools, got ${err}`);
        throw err;        
    }

    // Generate proposals.
    let proposals: IMatch[];
    try {
        proposals = makeMatches(req.profile, poolTickets)
    } catch (err) {
        console.log(`Failed to generate matches, got ${err}`);
        throw err;
    }

    return proposals
}

async function main(): Promise<void> {
  // connect to Open Match query service.

    startMatchFunctionService(serverPort, run);
}

main().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
