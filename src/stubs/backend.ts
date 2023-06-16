import * as grpc from '@grpc/grpc-js';
import readRpcStream from '../helpers/readRpcStream';
import { 
    RpcBackendService, 
    IBackendService, 
    IAssignTicketsRequest,
    IAssignTicketsResponse,
    IFetchMatchesRequest,
    IMatch } from '../definitions';

export default class BackendService implements IBackendService {
    private client: any;

    constructor(address: string) {
        this.client = new RpcBackendService(address, grpc.credentials.createInsecure());
        
    }

    fetchMatches(req: IFetchMatchesRequest): grpc.ClientReadableStream<IMatch> {
        return this.client.FetchMatches(req);
    }

    assignTickets(req: IAssignTicketsRequest): Promise<IAssignTicketsResponse> {
        return new Promise((resolve, reject) => {
            this.client.AssignTickets(req, (err: Error, res: IAssignTicketsResponse) => {
                err ? reject(err) : resolve(res);
            });
        });
    }

    fetchMatchesAsync(req: IFetchMatchesRequest): Promise<IMatch[]> {
        return readRpcStream<IMatch>(this.client.FetchMatches(req));
    }
}