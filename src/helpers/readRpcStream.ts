import * as grpc from '@grpc/grpc-js';

export default function readRpcStream<T>(stream: grpc.ClientReadableStream<T>): Promise<T[]> { 
    return new Promise((resolve, reject) => {
        const items: T[] = [];
        stream.on('data', (item: T) => {
            items.push(item);
        });
        stream.on('end', () => {
            resolve(items);
        });
        stream.on('error', (err: Error) => {
            reject(err);
        });
    });
}