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

export type GRPCClientCallMethod<RequestType, ResponseType> = (
    argument: RequestType,
    metadata?: grpc.Metadata,
    options?: IGRPCClientCallOptions,
) => Promise<ResponseType>;

// tslint:disable-next-line: no-empty-interface
export interface IGRPCClientMapOfMethods {
    // [index: string]: GRPCClientCallMethod<any, any>;
}

// prettier-ignore
export class GRPCClient<T extends IGRPCClientMapOfMethods = IGRPCClientMapOfMethods> {
    constructor(options: IGRPCClientOptions) {
        this.packageDefinition = protoLoader.loadSync(
            options.filepath,
            { keepCase: true, ...options },
        );

        // prettier-ignore
        const Client = grpc.loadPackageDefinition(this.packageDefinition)[options.package] as any;

        this.client = new Client[options.service](
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

    public call
            <K extends keyof T,
            RequestType = T[keyof T] extends GRPCClientCallMethod<infer U, any> ? U : any,
            ResponseType = T[keyof T] extends GRPCClientCallMethod<any, infer U> ? U : any>
        (methodName: K, argument: T[K] extends GRPCClientCallMethod<infer U, any> ? U : any, options?: IGRPCClientCallOptions): Promise<ResponseType>;

    // prettier-ignore
    public call<RequestType, ResponseType>(methodName: string, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType> {
        // tslint:disable-next-line: no-parameter-reassignment
        options = { metadata: undefined, ...options! };

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

    public close: typeof grpc.Client.prototype.close = this.client.close.bind(this.client);
    public getChannel: typeof grpc.Client.prototype.getChannel = this.client.getChannel.bind(this.client);
    public waitForReady: typeof grpc.Client.prototype.waitForReady = this.client.waitForReady.bind(this.client);
    public makeUnaryRequest: typeof grpc.Client.prototype.makeUnaryRequest = this.client.makeUnaryRequest.bind(this.client);
    public makeBidiStreamRequest: typeof grpc.Client.prototype.makeBidiStreamRequest = this.client.makeBidiStreamRequest.bind(this.client);
    public makeClientStreamRequest: typeof grpc.Client.prototype.makeClientStreamRequest = this.client.makeClientStreamRequest.bind(this.client);
    public makeServerStreamRequest: typeof grpc.Client.prototype.makeServerStreamRequest = this.client.makeServerStreamRequest.bind(this.client);
}
