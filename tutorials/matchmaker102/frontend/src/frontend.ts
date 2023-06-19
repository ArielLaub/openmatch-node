import FrontendService from 'openmatch-node/stubs/frontend';
import { IFrontendService } from 'openmatch-node/definitions';

const omFrontendEndpoint = 'open-match-frontend.open-match.svc.cluster.local:50504';
const ticketsPerIter = 10;

function makeTicket(): any {
    const modes = ['mode.demo', 'mode.ctf', 'mode.battleroyale'];
    const ticket = {
        search_fields: {
            tags: [modes[Math.floor(Math.random() * modes.length)]], // Randomly select a mode
            string_args: {
                "attributes.role": role()
            }
        }
    };
    console.log('Creating ticket:', ticket);
    return ticket;
}

function role(): string {
    const roles = ['role.dps', 'role.support', 'role.tank'];
    return roles[Math.floor(Math.random() * roles.length)];
}
async function createTicket(fe: IFrontendService): Promise<void> {
    try {
        const resp = await fe.createTicket({ ticket: makeTicket() });
        console.log('Ticket created successfully, id:', resp.id);
        deleteOnAssign(fe, resp.id);
    } catch (err) {
        console.log('Failed to create ticket', err);
    }
}

async function deleteOnAssign(fe: IFrontendService, ticketId: string): Promise<void> {
    while (true) {
        try {
            const got = await fe.getTicket({ ticket_id: ticketId });

            if (got.assignment !== null) {
            console.log('Ticket', got.id, 'got assignment', got.assignment);
            break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep for 1 second
        } catch (err) {
            console.log('Failed to get ticket:', err);
            break;
        }
    }

    try {
        await fe.deleteTicket({ ticket_id: ticketId });
    } catch (err) {
        console.log('Failed to delete ticket:', err);
    }
}

async function main(): Promise<void> {
  // Connect to Open Match Frontend
  const fe = new FrontendService(omFrontendEndpoint);

  setInterval(() => {
    console.log('sending tickets');
    for (let i = 0; i <= ticketsPerIter; i++) {
      createTicket(fe);
    }
  }, 2000);
}

main().catch((err) => {
  console.error('An error occurred:', err);
  process.exit(1);
});
