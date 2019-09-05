# @syrflover/grpc-client

## Installation

```
npm install @syrflover/grpc-client
```

## Usage

```protobuf
// user.proto
syntax = "proto3";

package User;

service UserService {
    rpc GetUser(GetUserParameters) returns (User) {}
    rpc AddUser(AddUserParameters) returns (User) {}
}

message User {
    required string id = 1;
    required string username = 2;
    required string email = 3;
    required string created_at = 4;
}

message AddUserParameters {
    required string username = 1;
    required string email = 2;
}

message GetUserParameters {
    required string type = 1;
    required string value = 2;
}
```

```typescript
// index.ts
import {
    IGRPCClientMapOfMethods,
    GRPCClientCallMethod,
    GRPCClient,
} from '@syrflover/grpc-client';

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
})();
```
