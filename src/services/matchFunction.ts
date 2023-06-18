import * as grpc from '@grpc/grpc-js';
import { IRunRequest, IMatch, RpcMatchFunction } from '../definitions';

export function startMatchFunctionService(serverPort: number, run: (req: IRunRequest) => Promise<IMatch[]>) {
    let server = new grpc.Server();
    server.addService(RpcMatchFunction.service, { 
        Run: async (call: grpc.ServerWritableStream<IRunRequest, IMatch>) => {
            const matches = await run(call.request);
            for (const match of matches) {
                call.write(match);
            }
            call.end();
        }
    });

    server.bindAsync('0.0.0.0:' + serverPort, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            throw err;
        }
        console.log('MatchFunction service listening on port ' + port);
        server.start();
    });
}
