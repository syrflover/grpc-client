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

export type GRPCClientCallFunction<RequestType, ResponseType> = (
    argument: RequestType,
    metadata?: grpc.Metadata,
    options?: IGRPCClientCallOptions,
) => Promise<ResponseType>;

export interface IGRPCClientMapOfMethod<RequestType = any, ResponseType = any> {
    [index: string]: GRPCClientCallFunction<RequestType, ResponseType>;
}

// prettier-ignore
export class GRPCClient<T extends IGRPCClientMapOfMethod<any, any> = IGRPCClientMapOfMethod<any, any>> {
    constructor(options: IGRPCClientOptions) {
        this.packageDefinition = protoLoader.loadSync(
            options.filepath,
            options,
        );

        // prettier-ignore
        const Client = grpc.loadPackageDefinition(this.packageDefinition)[options.package] as typeof grpc.Client;

        this.client = new Client(
            options.address,
            grpc.credentials.createInsecure(),
        );

        /* // prettier-ignore
        const methods = this.packageDefinition[`${options.package}.${options.service}`];

        for (const key in methods) {
            // prettier-ignore
            const method = methods[key as keyof typeof methods] as protoLoader.MethodDefinition<any, any>;
            const methodName = method.originalName!;
        } */
    }

    // prettier-ignore
    public call
        <RequestType = T extends IGRPCClientMapOfMethod<infer U, any> ? Promise<U> : Promise<any>,
        ResponseType = T extends IGRPCClientMapOfMethod<any, infer U> ? Promise<U> : Promise<any>>
        (methodName: keyof T, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType> {
        // tslint:disable-next-line: no-parameter-reassignment
        options = Object.assign({
            metadata: undefined,
        }, options);

        return new Promise((resolve, reject) => {
            const client = this.client as any;

            const cb = (error: grpc.ServiceError | null, data: ResponseType) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            };

            client[methodName](argument, options!.metadata, options, cb);

            // grpc.Client.prototype.makeUnaryRequest();
        });
    }

    public client: grpc.Client;
    public packageDefinition: protoLoader.PackageDefinition;
}
