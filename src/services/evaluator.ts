import * as grpc from '@grpc/grpc-js';
import { IEvaluateRequest, IEvaluateResponse, RpcEvaluator } from '../definitions';

export function startEvaluatorService(serverPort: number, evaluate: (req: IEvaluateRequest[]) => IEvaluateResponse[]) {
    let server = new grpc.Server();
    server.addService(RpcEvaluator.service, { 
        Evaluate: (call: grpc.ServerWritableStream<IEvaluateRequest, IEvaluateResponse>) => {
            const requests: IEvaluateRequest[] = [];
            call.on('data', (request: IEvaluateRequest) => {
                requests.push(request);
            });
            call.on('end', () => {
                const responses = evaluate(requests);
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
        console.log('Evaluator service listening on port ' + port);
        server.start();
    });
}
