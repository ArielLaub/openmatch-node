import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_FILES = [ 
    'query.proto', 
    'frontend.proto',
    'backend.proto',
    'evaluator.proto',
    'extensions.proto',
    'matchfunction.proto',
    'messages.proto',
    'google/any.proto',
    'google/empty.proto',
    'google/timestamp.proto'
].map((file) => __dirname + '/protos/' + file);

const packageDefinition = protoLoader.loadSync(PROTO_FILES, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

export const protoDescriptor = <any>grpc.loadPackageDefinition(packageDefinition);
export const RpcQueryService = protoDescriptor.openmatch.QueryService;
export const RpcFrontendService = protoDescriptor.openmatch.FrontendService;
export const RpcBackendService = protoDescriptor.openmatch.BackendService;
export const RpcMatchFunction = protoDescriptor.openmatch.MatchFunction;

// Google protobuf types
export interface IAny {
    type_url: string;
    value: Buffer;
}

export interface ITimestamp {
    seconds: number;
    nanos: number;
}

export interface IEmpty {

}

// Open Match types
export enum FunctionConfigType {
    GRPC = 0,
    REST = 1
}

export enum IAssignmentFailureCause {
    UNKNOWN = 0,
    TICKET_NOT_FOUND = 1
}

export interface ISearchFields {
    tags: string[];
    string_args: Record<string, string>;
    double_args: Record<string, number>;
}

export interface IAssignment {
    connection: string;
}

export interface ITicket {
    id: string;
    search_fields: ISearchFields;
    assignment: IAssignment;
}

export interface IDoubleRangeFilter {
    attribute: string;
    min: number;
    max: number;
}

export interface IStringEqualsFilter {
    attribute: string;
    value: string;
}

export interface ITagPresentFilter {
    tag: string;
}

export interface IPool {
    name: string;
    double_range_filters?: IDoubleRangeFilter[];
    string_equals_filters?: IStringEqualsFilter[];
    tag_present_filters?: ITagPresentFilter[];
    // If specified, only Tickets created before the specified time are selected.
    created_before?: ITimestamp;
    // If specified, only Tickets created after the specified time are selected.
    created_after?: ITimestamp; 
}

export interface IMatchProfile {
    name: string;
    pools: IPool[];

}

export interface IMatch {
    match_id: string;
    match_profile: string;
    tickets: ITicket[];
    match_function: string;
}

export interface IQueryTicketsRequest {
    pool: IPool;
}

export interface IQueryTicketsResponse {
    tickets: ITicket[];
}

export interface IQueryTicketIdsRequest {
    pool: IPool;
}

export interface IQueryTicketIdsResponse {
    ids: string[];
}

export interface IQueryBackfillsRequest {
    pool: IPool;
}

export interface IBackfill {
    id: string;
  
    // Search fields are the fields which Open Match is aware of, and can be used
    // when specifying filters.
    search_fields: ISearchFields;
  
    // Customized information not inspected by Open Match, to be used by
    // the Match Function, evaluator, and components making calls to Open Match.
    // Optional, depending on the requirements of the connected systems.
    extensions: { [key: string]: IAny };
    // Customized information not inspected by Open Match, to be kept persistent 
    // throughout the life-cycle of a backfill. 
    // Optional, depending on the requirements of the connected systems.
    persistent_field: { [key: string]: IAny };
  
    // Create time is the time the Ticket was created. It is populated by Open
    // Match at the time of Ticket creation.
    create_time: ITimestamp;
  
    // Generation gets incremented on GameServers update operations.
    // Prevents the MMF from overriding a newer version from the game server.
    // Do NOT read or write to this field, it is for internal tracking, and changing the value will cause bugs.
    generation: number;
}

export interface IQueryBackfillsResponse {
    backfills: IBackfill[];
}

export interface IRunRequest {
    profile: IMatchProfile;
}

export interface IRunResponse {
    proposal: IMatch;
}

export interface IFunctionConfig {
    host: string;
    port: number;
    type: FunctionConfigType;
}

export interface IFetchMatchesRequest {
    config: IFunctionConfig;
    profile: IMatchProfile;
}

export interface IAssignmentGroup {
    ticket_ids: string[];
    assignment: IAssignment;
}

export interface IAssignTicketsRequest {
    assignments: IAssignmentGroup[];
}

export interface IAssignmentFailure {
    ticket_id: string;
    cause: IAssignmentFailureCause;
}

export interface IAssignTicketsResponse {
    failures: IAssignmentFailure[];
}

export interface ICreateTicketRequest {
    ticket: ITicket;
}

export interface IDeleteTicketRequest {
    ticket_id: string;
}

export interface IGetTicketRequest {
    ticket_id: string;
}

// Open Match services
export interface IFrontendService {
    createTicket(req: ICreateTicketRequest): Promise<ITicket>;
    deleteTicket(req: IDeleteTicketRequest): Promise<void>;
    getTicket(req: IGetTicketRequest): Promise<ITicket>;
}

export interface IQueryService {
    queryTickets(request: IQueryTicketsRequest): grpc.ClientReadableStream<IQueryTicketsResponse>;
    queryTicketIds(request: IQueryTicketIdsRequest): grpc.ClientReadableStream<IQueryTicketIdsResponse>;
    queryBackfills(request: IQueryBackfillsRequest): grpc.ClientReadableStream<IQueryBackfillsResponse>;

    queryTicketsAsync(request: IQueryTicketsRequest): Promise<IQueryTicketsResponse[]>;
    queryTicketIdsAsync(request: IQueryTicketIdsRequest): Promise<IQueryTicketIdsResponse[]>;
    queryBackfillsAsync(request: IQueryBackfillsRequest): Promise<IQueryBackfillsResponse[]>;
}

export interface IBackendService {
    fetchMatches(req: IFetchMatchesRequest): grpc.ClientReadableStream<IMatch>;
    assignTickets(req: IAssignTicketsRequest): Promise<IAssignTicketsResponse>;

    fetchMatchesAsync(req: IFetchMatchesRequest): Promise<IMatch[]>;
}
