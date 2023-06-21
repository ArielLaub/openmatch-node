import { IRunRequest, IRunResponse, IMatchProfile, ITicket } from 'openmatch-node/definitions';
import { startMatchFunctionService } from 'openmatch-node/services/matchfunction';
import QueryService from 'openmatch-node/stubs/query';
import { queryPools } from 'openmatch-node/helpers/matchfunction';
import marshalAny from 'openmatch-node/helpers/marshalany';
import { v4 as uuidv4 } from 'uuid';

// the endpoint for the Open Match query service.
const queryServiceAddress = 'open-match-query.open-match.svc.cluster.local:50503';
// The number of tickets to fetch per pool per match.
const ticketsPerPoolPerMatch = 4; 
// The port for hosting the Match Function.
const serverPort = 50502; 
// Match maker name
const matchName = 'basic-matchfunction';

const queryClient = new QueryService(queryServiceAddress);

function makeMatches(p: IMatchProfile, poolTickets: { [pool: string]: ITicket[] }): IRunResponse[] {
    const responses: IRunResponse[] = [];
    // let count = 0;
    console.log(`Generating proposals for profile ${p.name}`);
    // changed some minor things from the original code:
    // 1. limit the number of matches to 100 so matching doesn't hang if
    //    the frontend ran without a director for a long period of time.
    // 2. changed match id to uuidv4() instead of using the time template
    //    this was just annoying for me in the logs.
    // 3. break out of loop only if all pools are empty not on the first one!
    //    this I think is a bug throughout the tutorial codes in golang. but
    //    I might be wrong...
    while (true && responses.length < 100) {
        let emptyPools = 0;
        const poolNames = Object.keys(poolTickets);
        const matchTickets: ITicket[] = [];  
        for (let i = 0; i < poolNames.length; i++) {
            const poolName = poolNames[i];
            const tickets = poolTickets[poolName];
            if (tickets.length < ticketsPerPoolPerMatch) {
                // This pool is completely drained out. Stop creating matches.
                emptyPools++;
            } else {
                // Remove the Tickets from this pool and add to the match proposal.
                matchTickets.push(...tickets.slice(0, ticketsPerPoolPerMatch));
                poolTickets[poolName] = tickets.slice(ticketsPerPoolPerMatch);
            }
        }
        if (emptyPools == poolNames.length) {
            break;
        }

        //const matchId = `profile-${p.name}-time-${new Date().toISOString()}-${count++}`;
        const matchId = uuidv4();

        responses.push({
            proposal: {
                match_id: matchId,
                match_profile: p.name,
                match_function: matchName,
                tickets: matchTickets
            }
        });
        console.log(`   -> Generated match ${matchId} with ${matchTickets.length} tickets`);
    }
    console.log(`Generated ${responses.length} proposals for profile ${p.name}`);
    return responses;
}

async function run(req: IRunRequest): Promise<IRunResponse[]> {
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
    let proposals: IRunResponse[];
    try {
        proposals = makeMatches(req.profile, poolTickets)
    } catch (err) {
        console.log(`Failed to generate matches, got ${err}`);
        throw err;
    }

    return proposals
}

async function main(): Promise<void> {
    startMatchFunctionService(serverPort, run);
}

main().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
