import {
    IGRPCClientMapOfMethods,
    GRPCClientCallMethod,
    GRPCClient,
    ParseRequestType,
    ParseResponseType,
} from './src';

interface IUserMethods extends IGRPCClientMapOfMethods {
    getUser: GRPCClientCallMethod<
        // RequestType
        { type: 'id' | 'username' | 'email'; value: string },
        // ResponseType
        { id: string; username: string; email: string; created_at: string }
    >;
    addUser: GRPCClientCallMethod<
        // RequestType
        { username: string; email: string },
        // ResponseType
        { id: string; username: string; email: string; created_at: string }
    >;
}

(async () => {
    const client = new GRPCClient<IUserMethods>({
        filepath: './user.proto',
        address: '0.0.0.0:12345',
        package: 'User',
        service: 'UserService',
    });

    await client.call('addUser', {
        username: 'syr',
        email: 'syr@meu.works',
    });

    const user = await client.call('getUser', {
        type: 'email',
        value: 'syr@meu.works',
    });

    user.id;
    user.username;
    user.email;
    user.created_at;

    type RequestType = ParseRequestType<IUserMethods['getUser']>;
    type ResponseType = ParseResponseType<IUserMethods['getUser']>;
})();

interface ITestMethods extends IGRPCClientMapOfMethods {
    a: GRPCClientCallMethod<{ a: number }, { b: string }>;
    b: GRPCClientCallMethod<{ b: string }, { a: number }>;
}

(async () => {
    const client = new GRPCClient<ITestMethods>({
        filepath: './test.proto',
        address: '0.0.0.0:12345',
        package: 'Test',
        service: 'TestService',
    });

    const a = await client.call('a', { a: 1 });
    a.b;

    const b = await client.call('b', { b: 'str' });
    b.a;
})();
