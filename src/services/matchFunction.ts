import * as grpc from '@grpc/grpc-js';
import { IRunRequest, IMatch, RpcMatchFunction } from '../definitions';

export function startMatchFunctionService(serverPort: number, run: (req: IRunRequest) => Promise<IMatch[]>) {
    let server = new grpc.Server();
    server.addService(RpcMatchFunction.service, { 
        Run: (call: grpc.ServerWritableStream<IRunRequest, IMatch>) => {
            run(call.request).then(matches => {
                for(let i = 0; i < matches.length; i++) {
                    call.write(matches[i]);
                }
                call.end();
            });
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
