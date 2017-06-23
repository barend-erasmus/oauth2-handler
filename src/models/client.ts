export class Client {
    constructor(public name: string, public clientId: string, public clientSecret: string, public redirectUris: string[], public scopes: string[]) {

    }
}