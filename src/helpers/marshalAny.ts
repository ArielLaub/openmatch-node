import { IAny, protoDescriptor } from '../definitions';
import { Message } from 'protobufjs';

function uintArrayToBuffer(arr: Uint8Array): Buffer {
  const buf = Buffer.from(arr.buffer);
  if (arr.byteLength !== arr.buffer.byteLength) {
      return buf.subarray(arr.byteOffset, arr.byteOffset + arr.byteLength);
  } else {
      return buf;
  }
}

export default function marshalAny(obj: any, typeName: string): IAny {
  const message = new protoDescriptor.openmatch[typeName](obj);
  return {
      type_url: `type.googleapis.com/openmatch.${typeName}`,
      value: uintArrayToBuffer(Message.encode(message).finish())
  }
}