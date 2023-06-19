import * as grpc from '@grpc/grpc-js';
import { IRunRequest, IRunResponse, RpcMatchFunction } from '../definitions';

export function startMatchFunctionService(serverPort: number, run: (req: IRunRequest) => Promise<IRunResponse[]>) {
    let server = new grpc.Server();
    server.addService(RpcMatchFunction.service, { 
        Run: (call: grpc.ServerWritableStream<IRunRequest, IRunResponse>) => {
            run(call.request).then(responses => {
                for(let i = 0; i < responses.length; i++) {
                    call.write(responses[i]);
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
