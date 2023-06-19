import { 
    ITicket, 
    IPool, 
    IQueryService, 
    IBackfill,
    IQueryTicketsRequest,
    IQueryTicketsResponse,
    IQueryBackfillsRequest,
    IQueryBackfillsResponse  } from '../definitions';

// QueryPool queries queryService and returns the tickets that belong to the specified pool.
export async function queryPool(queryClient: IQueryService, pool: IPool): Promise<ITicket[]> {
    const request: IQueryTicketsRequest = { pool };
    try {
        const query = queryClient.queryTickets(request);
        const tickets: ITicket[] = [];
        while (true) {
            const response: IQueryTicketsResponse | undefined = await new Promise((resolve, reject) => {
                query.on('data', (data: IQueryTicketsResponse) => {
                    resolve(data);
                });

                query.on('error', reject);

                query.on('end', () => {
                    resolve(undefined);
                });
            });

            if (!response) {
                return tickets;
            }

            tickets.push(...response.tickets);
        }
    } catch (err) {
        throw new Error(`error calling queryService.QueryTickets: ${err}`);
    }
}

// QueryPools queries queryService and returns a map of pool names to the tickets belonging to those pools.
export async function queryPools(queryClient: IQueryService, pools: IPool[]): Promise<Record<string, ITicket[]>> {
    const results: { name: string, tickets: ITicket[] }[] = [];
  
    for (const pool of pools) {
        try {
            const tickets = await queryPool(queryClient, pool);
            results.push({ name: pool.name, tickets });
        } catch (err) {
            throw new Error(`error calling QueryPool for pool ${pool.name}: ${err}`);
        }
    }
  
    const poolMap: Record<string, ITicket[]> = {};
    for (const result of results) {  
        poolMap[result.name] = result.tickets;
    }
  
    return poolMap;
}

// QueryBackfillPool queries queryService and returns the backfills that belong to the specified pool.
export async function queryBackfillPool(queryClient: IQueryService, pool: IPool): Promise<IBackfill[]> {

    const request: IQueryBackfillsRequest = { pool };
    try {
        const query = queryClient.queryBackfills(request);
        const backfills: IBackfill[] = [];
        while (true) {
            const response: IQueryBackfillsResponse | undefined = await new Promise((resolve, reject) => {
                query.on('data', (data: IQueryBackfillsResponse) => {
                    resolve(data);
                });

                query.on('error', reject);

                query.on('end', () => {
                    resolve(undefined);
                });
            });

            if (!response) {
                return backfills;
            }

            backfills.push(...response.backfills);
        }
    } catch (err) {
        throw new Error(`error calling queryService.QueryBackfills: ${err}`);
    }
}

// QueryBackfillPools queries queryService and returns a map of pool names to the backfills belonging to those pools.
export async function queryBackfillPools(queryClient: IQueryService, pools: IPool[]): Promise<Record<string, IBackfill[]>> {
    const results: { name: string, backfills: IBackfill[] }[] = [];  
    for (const pool of pools) {
        try {
            const backfills = await queryBackfillPool(queryClient, pool);
            results.push({ name: pool.name, backfills });
        } catch (err) {
            throw new Error(`error calling QueryPool for pool ${pool.name}: ${err}`);
        }
    }
  
    const poolMap: Record<string, IBackfill[]> = {};
    for (const result of results) {  
        poolMap[result.name] = result.backfills;
    }
  
    return poolMap;
}
