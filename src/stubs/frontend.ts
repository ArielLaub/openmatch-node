import * as grpc from '@grpc/grpc-js';
import { 
    RpcFrontendService, 
    IFrontendService, 
    ITicket, 
    ICreateTicketRequest,
    IDeleteTicketRequest,
    IGetTicketRequest } from '../definitions';

export default class FrontendService implements IFrontendService {
    private client: any;

    constructor(address: string) {
        this.client = new RpcFrontendService(address, grpc.credentials.createInsecure());
        
    }

    createTicket(req: ICreateTicketRequest): Promise<ITicket> {
        return new Promise((resolve, reject) => {
            this.client.CreateTicket(req, (err: Error, res: ITicket) => {
                err ? reject(err) : resolve(res);
            });
        });
    }

    deleteTicket(req: IDeleteTicketRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.DeleteTicket(req, (err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }

    getTicket(req: IGetTicketRequest): Promise<ITicket> {
        return new Promise((resolve, reject) => {
            this.client.GetTicket(req, (err: Error, res: ITicket) => {
                err ? reject(err) : resolve(res);
            });
        });
    }
}