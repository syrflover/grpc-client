import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// prettier-ignore
export type ParseRequestType<
    T extends GRPCClientCallMethod<any, any>
> = T extends GRPCClientCallMethod<infer RequestType, any>
    ? RequestType
    : any;

// prettier-ignore
export type ParseResponseType<
    T extends GRPCClientCallMethod<any, any>
> = T extends GRPCClientCallMethod<any, infer ResponseType>
    ? ResponseType
    : any;

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
            { keepCase: true, arrays: true, ...options },
        );

        this.service = options.service;
        this.package = options.package;

        const Client = grpc.loadPackageDefinition(this.packageDefinition)[options.package] as any;

        this.client = new Client[options.service](
            options.address,
            grpc.credentials.createInsecure(),
        );
    }
    private service: string;
    private package: string;

    public call
            <K extends keyof T>
        (methodName: K, argument: T[K] extends GRPCClientCallMethod<infer U, any> ? U : any, options?: Partial<IGRPCClientCallOptions>): Promise<T[K] extends GRPCClientCallMethod<any, infer U> ? U : any>;
    // public call<RequestType, ResponseType>(methodName: string, argument: RequestType, options?: IGRPCClientCallOptions): Promise<ResponseType>;

    public call<RequestType, ResponseType>(methodName: string, argument: RequestType, options: Partial<IGRPCClientCallOptions> = {}): Promise<ResponseType> {
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

            if (!(methodName in client)) {
                const notFoundError = new Error(`Not Found ${methodName} in ${this.service}`);
                reject(notFoundError);
                return;
            }

           client[methodName](argument, options!.metadata, options, cb);

            // as grpc.Client.prototype.makeUnaryRequest();
        });
    }

    public client: grpc.Client;
    public packageDefinition: protoLoader.PackageDefinition;

    public close() {
        return this.client.close();
    }

    public getChannel() {
        return this.client.getChannel();
    }

    public waitForReady(deadline: grpc.Deadline, callback: (error: Error | undefined) => void) {
        return this.client.waitForReady(deadline, callback);
    }

    public makeUnaryRequest
        <RequestType, ResponseType>
        (method: string,
        serialize: grpc.serialize<RequestType>,
        deserialize: grpc.deserialize<ResponseType>,
        argument: RequestType,
        metadata: grpc.Metadata | null,
        options: grpc.CallOptions | null,
        callback: grpc.requestCallback<ResponseType>) {
        
        const metadata_ = metadata ? metadata : new grpc.Metadata();
        const options_ = options ? options :{};

        return this.client.makeUnaryRequest<RequestType, ResponseType>(method, serialize, deserialize, argument, metadata_, options_, callback);
    }

    public makeBidiStreamRequest
        <RequestType, ResponseType>
        (method: string,
        serialize: grpc.serialize<RequestType>,
        deserialize: grpc.deserialize<ResponseType>,
        metadata?: grpc.Metadata | null,
        options?: grpc.CallOptions | null) {
            
        const metadata_ = metadata ? metadata : new grpc.Metadata();
        const options_ = options ? options : {};

        return this.client.makeBidiStreamRequest<RequestType, ResponseType>(method, serialize, deserialize, metadata_, options_);
    }

    public makeClientStreamRequest
        <RequestType, ResponseType>
        (method: string,
        serialize: grpc.serialize<RequestType>,
        deserialize: grpc.deserialize<ResponseType>,
        metadata: grpc.Metadata | null,
        options: grpc.CallOptions | null,
        callback: grpc.requestCallback<ResponseType>) {
            
        const metadata_ = metadata ? metadata : new grpc.Metadata();
        const options_ = options ? options : {};

        return this.client.makeClientStreamRequest<RequestType, ResponseType>(method, serialize, deserialize, metadata_, options_, callback);
    }

    public makeServerStreamRequest
        <RequestType, ResponseType>
        (method: string,
        serialize: grpc.serialize<RequestType>,
        deserialize: grpc.deserialize<ResponseType>,
        argument: RequestType,
        metadata?: grpc.Metadata | null,
        options?: grpc.CallOptions | null) {
            
        const metadata_ = metadata ? metadata : new grpc.Metadata();
        const options_ = options ? options : {};

        return this.client.makeServerStreamRequest<RequestType, ResponseType>(method, serialize, deserialize, argument, metadata_, options_);
    }
}
