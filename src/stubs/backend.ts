import * as grpc from '@grpc/grpc-js';
import readRpcStream from '../helpers/readRpcStream';
import { 
    RpcBackendService, 
    IBackendService, 
    IAssignTicketsRequest,
    IAssignTicketsResponse,
    IFetchMatchesRequest,
    IFetchMatchesResponse,
    IMatch } from '../definitions';

export default class BackendService implements IBackendService {
    private client: any;

    constructor(address: string) {
        this.client = new RpcBackendService(address, grpc.credentials.createInsecure());
    }

    fetchMatches(req: IFetchMatchesRequest): grpc.ClientReadableStream<IFetchMatchesResponse> {
        return this.client.FetchMatches(req);
    }

    assignTickets(req: IAssignTicketsRequest): Promise<IAssignTicketsResponse> {
        return new Promise((resolve, reject) => {
            this.client.AssignTickets(req, (err: Error, res: IAssignTicketsResponse) => {
                err ? reject(err) : resolve(res);
            });
        });
    }

    fetchMatchesAsync(req: IFetchMatchesRequest): Promise<IFetchMatchesResponse[]> {
        return readRpcStream<IFetchMatchesResponse>(this.client.FetchMatches(req));
    }
}