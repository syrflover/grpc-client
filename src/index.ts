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

// tslint:disable-next-line: no-empty-interface
export interface IGRPCClientMapOfMethod {
    [index: string]: GRPCClientCallFunction<any, any>;
}

// prettier-ignore
export class GRPCClient<T extends IGRPCClientMapOfMethod = IGRPCClientMapOfMethod> {
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

    public call<K extends keyof T,
        RequestType = T[K] extends GRPCClientCallFunction<infer U, any> ? U : any,
        ResponseType = T[K] extends GRPCClientCallFunction<any, infer U> ? U : any>
    (methodName: K, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType>;

    public call<RequestType, ResponseType>(methodName: string, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType>;

    public call(methodName: string, argument: any, options?: IGRPCClientCallOptions): Promise<any>;
    // prettier-ignore
    public call
        <K extends keyof T,
        RequestType = T[K] extends GRPCClientCallFunction<infer U, any> ? U : any,
        ResponseType = T[K] extends GRPCClientCallFunction<any, infer U> ? U : any>
        (methodName: K, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType> {
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
