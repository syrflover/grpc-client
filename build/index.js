"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
// prettier-ignore
class GRPCClient {
    constructor(options) {
        this.packageDefinition = protoLoader.loadSync(options.filepath, options);
        // prettier-ignore
        const Client = grpc.loadPackageDefinition(this.packageDefinition)[options.package];
        this.client = new Client(options.address, grpc.credentials.createInsecure());
        /* // prettier-ignore
        const methods = this.packageDefinition[`${options.package}.${options.service}`];

        for (const key in methods) {
            // prettier-ignore
            const method = methods[key as keyof typeof methods] as protoLoader.MethodDefinition<any, any>;
            const methodName = method.originalName!;
        } */
    }
    // prettier-ignore
    call(methodName, argument, options) {
        // tslint:disable-next-line: no-parameter-reassignment
        options = Object.assign({
            metadata: undefined,
        }, options);
        return new Promise((resolve, reject) => {
            const client = this.client;
            const cb = (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(data);
            };
            client[methodName](argument, options.metadata, options, cb);
            // grpc.Client.prototype.makeUnaryRequest();
        });
    }
}
exports.GRPCClient = GRPCClient;
//# sourceMappingURL=index.js.map