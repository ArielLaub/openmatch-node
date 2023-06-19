import { 
    IPool,
    IMatchProfile, 
    IBackendService, 
    IAssignTicketsRequest,
    IMatch,
    IFetchMatchesResponse,
    FunctionConfigType } from 'openmatch-node/definitions';
import BackendService from 'openmatch-node/stubs/backend';

// The endpoint for the Open Match Backend service.
const omBackendEndpoint = 'open-match-backend.open-match.svc.cluster.local:50505';
// The Host and Port for the Match Function service endpoint.
const functionHostName = 'mm102-tutorial-matchfunction.mm102-tutorial.svc.cluster.local'
const functionPort = 50502;

function generateProfiles(): IMatchProfile[] {
    const profiles: IMatchProfile[] = [];
    const modes = ['mode.demo', 'mode.ctf', 'mode.battleroyale'];
    const roles = ['role.dps', 'role.support', 'role.tank'];

    for (const mode of modes) {
        const pools: IPool[] = [];
        for (const role of roles) {
            pools.push({
                name: `pool_${mode}_${role}`,
                tag_present_filters: [{
                    tag: mode
                }],
                string_equals_filters: [{
                    string_arg: 'attributes.role',
                    value: role
                }]
            });
        }
        const profile: IMatchProfile = {
            name: 'mode_based_profile_' + mode, 
            pools
        } 
        profiles.push(profile);
    }

  return profiles;
}

async function fetch(be: IBackendService, p: IMatchProfile): Promise<IMatch[]> {
    try {
        const responses = await be.fetchMatchesAsync({
            config: {
                host: functionHostName,
                port: functionPort,
                type: FunctionConfigType.GRPC
            },
            profile: p
        });
        return responses.map((r: IFetchMatchesResponse) => r.match);
    } catch (err) {
        throw new Error(`Failed to fetch matches for profile ${p.name}, got ${err}`);
    }
}

async function assign(be: IBackendService, matches: IMatch[]): Promise<void> {
    for (const match of matches) {
        const ticketIDs: string[] = [];
  
        try {
            for (const ticket of match.tickets) {
                ticketIDs.push(ticket.id);
            }
  
            const conn = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
            const req: IAssignTicketsRequest = {
                assignments: [{
                    assignment: { connection: conn },
                    ticket_ids: ticketIDs
                }]
            }
  
            await be.assignTickets(req);
            console.log(`Assigned server ${conn} to match ${match.match_id}`);
        } catch (err) {
            console.log('cannot assign tickets for match:');
            console.log(JSON.stringify(match, null, 2));
            throw new Error(`AssignTickets failed for match ${match.match_id}, got ${err}`);
        }
    }
}

async function main(): Promise<void> {
  // Connect to Open Match Backend
    const be = new BackendService(omBackendEndpoint);

    while (true) {
        // Generate the profiles to fetch matches for
        const profiles = generateProfiles();
        console.log(`Fetching matches for ${profiles.length} profiles`);
    
        const matchPromises = profiles.map((profile) => fetch(be, profile));
        const matches = await Promise.all(matchPromises);

        try {
            await assign(be, matches.flat());
        } catch (err) {
            console.log('Failed to assign servers to matches:', err);
        }
    
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep for 5 seconds
    }
}

main().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
