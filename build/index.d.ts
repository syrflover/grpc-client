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
export interface IGRPCClientMappingOfMethod<RequestType = any, ResponseType = any> {
    [index: string]: GRPCClientCallFunction<RequestType, ResponseType>;
}
export declare class GRPCClient<T extends IGRPCClientMappingOfMethod<any, any> = IGRPCClientMappingOfMethod<any, any>> {
    constructor(options: IGRPCClientOptions);
    call<RequestType = T extends IGRPCClientMappingOfMethod<infer U, any> ? Promise<U> : Promise<any>, ResponseType = T extends IGRPCClientMappingOfMethod<any, infer U> ? Promise<U> : Promise<any>>(methodName: string, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType>;
    client: grpc.Client;
    packageDefinition: protoLoader.PackageDefinition;
}
