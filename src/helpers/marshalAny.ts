import { IAny, protoRoot } from '../definitions';

function uintArrayToBuffer(arr: Uint8Array): Buffer {
    const buf = Buffer.from(arr.buffer);
    if (arr.byteLength !== arr.buffer.byteLength) {
        return buf.subarray(arr.byteOffset, arr.byteOffset + arr.byteLength);
    } else {
        return buf;
    }
}

export default function marshalAny(obj: any, typeName: string): IAny {
    const message = protoRoot.lookupType(typeName);
    return {
        type_url: `type.googleapis.com/${typeName}`,
        //value: Message.encode(message).finish()
        value: uintArrayToBuffer(message.encode(message.create(obj)).finish())
    }
}