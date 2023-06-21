import { IMatch, IEvaluateRequest, IEvaluateResponse } from 'openmatch-node/definitions';

interface IMatchEval {
    match: IMatch;
    maxWait: number;
}
  
interface ICollidingMatch {
    id: string;
    maxWait: number;
}
  
class Decollider {
    responses: IEvaluateResponse[];
    ticketsUsed: Record<string, ICollidingMatch>;
  
    constructor() {
        this.responses = [];
        this.ticketsUsed = {};
    }
  
    maybeAdd(m: IMatchEval) {
        for (const t of m.match.tickets) {
            if (t.id in this.ticketsUsed) {
                const cm = this.ticketsUsed[t.id];
                console.log(`Rejecting Match ${m.match.match_id}(max_wait:${m.maxWait}) as its ticket ${t.id} collides with Match ${cm.id} (max_wait:${cm.maxWait}).`);
                return;
            }
        }
  
        for (const t of m.match.tickets) {
            this.ticketsUsed[t.id] = { 
                id: m.match.match_id, 
                maxWait: m.maxWait
            };
        }
  
        this.responses.push({ match_id: m.match.match_id });
    }
}

// the signature of this function is different from the original golang equivalent
// these types are the ones used by the underlying grpc service so to eliminate any
// mem copies we use them here as well.
export default function evaluate(requests: IEvaluateRequest[]): IEvaluateResponse[] {
    const matches: IMatchEval[] = [];
    const now = (new Date).getTime() * 1e-6;

    for (const request of requests) {
        const match = request.match;
        let maxWait = 0;

        for (const t of match.tickets) {
            const qt = now - t.search_fields.double_args['time.enterqueue'];
            if (qt > maxWait) {
                maxWait = qt;
            }
        }

        matches.push({ match, maxWait });
    }

    matches.sort((a, b) => b.maxWait - a.maxWait);

    const d = new Decollider();

    for (const m of matches) {
        d.maybeAdd(m);
    }

    return d.responses;
}