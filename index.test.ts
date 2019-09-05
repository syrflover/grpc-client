import {
    IGRPCClientMapOfMethod,
    GRPCClientCallFunction,
    GRPCClient,
} from './src';

interface IReaderMethods extends IGRPCClientMapOfMethod {
    // getReader: (argument: { type: 'id' | 'username' | 'email' }) => Promise<Reader>;
    getReader: GRPCClientCallFunction<
        { type: 'id' | 'username' | 'email'; value: string },
        { id: string; username: string; email: string; created_at: string }
    >;
    addReader: GRPCClientCallFunction<
        { username: string; email: string },
        { id: string; username: string; email: string; created_at: string }
    >;
}

(async () => {
    const client = new GRPCClient<IReaderMethods>({
        filepath: './proto/reader.proto',
        address: '0.0.0.0:11111',
        package: 'Reader',
        service: 'ReaderService',
    });

    const reader = await client.call('getReader', {
        type: 'email',
        value: 'syr@meu.works',
    });
    reader.id;
    reader.username;
    reader.email;
    reader.created_at;
    client.call('addReader', { username: 'syr', email: 'syr@meu.works' });
})();
