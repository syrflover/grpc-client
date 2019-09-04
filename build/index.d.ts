import * as grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';
export interface IGRPCClientOptions extends protoLoader.Options {
    address: string;
    package: string;
    service: string;
    filepath: string;
}
export interface IGRPCClientCallOptions extends grpc.CallOptions {
    metadata?: grpc.Metadata;
}
export declare type GRPCClientCallFunction<RequestType, ResponseType> = (argument: RequestType, metadata?: grpc.Metadata, options?: IGRPCClientCallOptions) => Promise<ResponseType>;
export interface IGRPCClientMapOfMethod<RequestType = any, ResponseType = any> {
}
export declare class GRPCClient<T extends IGRPCClientMapOfMethod = IGRPCClientMapOfMethod> {
    constructor(options: IGRPCClientOptions);
    call<RequestType = T extends IGRPCClientMapOfMethod<infer U, any> ? U : any, ResponseType = T extends IGRPCClientMapOfMethod<any, infer U> ? U : any>(methodName: keyof T, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType>;
    client: grpc.Client;
    packageDefinition: protoLoader.PackageDefinition;
}
