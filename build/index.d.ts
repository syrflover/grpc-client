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
export interface IGRPCClientMapOfMethod {
    [index: string]: GRPCClientCallFunction<any, any>;
}
export declare class GRPCClient<T extends IGRPCClientMapOfMethod = IGRPCClientMapOfMethod> {
    constructor(options: IGRPCClientOptions);
    call<K extends keyof T, RequestType = T[K] extends GRPCClientCallFunction<infer U, any> ? U : any, ResponseType = T[K] extends GRPCClientCallFunction<any, infer U> ? U : any>(methodName: K, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType>;
    client: grpc.Client;
    packageDefinition: protoLoader.PackageDefinition;
}
