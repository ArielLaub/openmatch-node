import { 
    IQueryService, 
    IQueryBackfillsRequest, 
    IQueryTicketIdsRequest, 
    IQueryTicketsRequest,
    IQueryTicketsResponse,
    IQueryTicketIdsResponse,
    IQueryBackfillsResponse
 } from "../definitions";
import * as grpc from '@grpc/grpc-js';
import { RpcQueryService } from "../definitions";
import readRpcStream from "../helpers/readRpcStream";

export default class QueryService implements IQueryService {
    private client: IQueryService;

    constructor(address: string) {
        this.client = new RpcQueryService(address, grpc.credentials.createInsecure());
    }
    queryTickets(request: IQueryTicketsRequest): grpc.ClientReadableStream<IQueryTicketsResponse> {
        return this.client.queryTickets(request);
    }
    queryTicketIds(request: IQueryTicketIdsRequest): grpc.ClientReadableStream<IQueryTicketIdsResponse> {
        return this.client.queryTicketIds(request);
    }
    queryBackfills(request: IQueryBackfillsRequest): grpc.ClientReadableStream<IQueryBackfillsResponse> {
        return this.client.queryBackfills(request);
    }

    queryTicketsAsync(request: IQueryTicketsRequest): Promise<IQueryTicketsResponse[]> {
        return readRpcStream<IQueryTicketsResponse>(this.client.queryTickets(request));
    }
    queryTicketIdsAsync(request: IQueryTicketIdsRequest): Promise<IQueryTicketIdsResponse[]> {
        return readRpcStream<IQueryTicketIdsResponse>(this.client.queryTicketIds(request));
    }
    queryBackfillsAsync(request: IQueryBackfillsRequest): Promise<IQueryBackfillsResponse[]> {
        return readRpcStream<IQueryBackfillsResponse>(this.client.queryBackfills(request));
    }

}