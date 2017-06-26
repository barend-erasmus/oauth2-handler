// Imports 
import * as co from 'co';

// Imports models
import { AccessToken } from './accessToken';
import { Client } from './client';
import { AuthCode } from './authCode';
import { User } from './user';
import { Model } from './model';

export class Handler {

    constructor(
        public getClient: (clientId: string) => Promise<Client>,
        public getUser: (clientId: string, username: string, password: string) => Promise<User>,
        public saveModel: (model: Model) => Promise<void>,
        public getModelByAuthCode: (code: string) => Promise<Model>,
        public grants: string[],
        public accessTokenLifetimeInSeconds: number,
        public refreshTokenLifetimeInSeconds: number,
        public authCodeLifetimeInSeconds: number,
        public debug: boolean
    ) {

    }

    public authorizationCodeGrantCode(responseType: string, clientId: string, redirectUri: string, scopes: string[], state: string, username: string, password: string): Promise<AuthCode> {
        const self = this;
        return co(function* () {

            // Validate responseType
            if (responseType !== 'code') {
                throw new Error('Invalid response type');
            }

            const client: Client = yield self.getClient(clientId);

            // Validate client
            if (!client) {
                throw new Error('Invalid client id');
            }

            // Validate redirect uri
            if (client.redirectUris.indexOf(redirectUri) === -1) {
                throw new Error('Invalid redirect uri');
            }

            // Validate scopes
            if (scopes.map((x) => client.scopes.indexOf(x)).filter((x) => x === -1).length !== 0) {
                throw new Error('Invalid scope(s)');
            }

            const user: User = yield self.getUser(clientId, username, password);

            // Validate user
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Validate scopes
            if (scopes.map((x) => user.scopes.indexOf(x)).filter((x) => x === -1).length !== 0) {
                throw new Error('Invalid scope(s)');
            }

            const authCode: AuthCode = new AuthCode(self.generateAuthCode(), self.authCodeLifetimeInSeconds, state, new Date());

            yield self.saveModel(new Model(responseType, null, client, user, redirectUri, scopes, state, authCode, null));

            return authCode;
        });
    }



    public authorizationCodeGrantToken(grantType: string, clientId: string, clientSecret: string, redirectUri: string, code: string): Promise<AccessToken> {
        const self = this;
        return co(function* () {

            // Validate grantType
            if (grantType !== 'authorization_code') {
                throw new Error('Invalid grant type');
            }

            const client: Client = yield self.getClient(clientId);

            // Validate client
            if (!client) {
                throw new Error('Invalid client id');
            }

            if (client.clientSecret !== clientSecret) {
                throw new Error('Invalid client secret');
            }

            // Validate redirect uri
            if (client.redirectUris.indexOf(redirectUri) === -1) {
                throw new Error('Invalid redirect uri');
            }

            const model: Model = yield self.getModelByAuthCode(code);

            // Validate client
            if (model.client.clientId !== clientId) {
                throw new Error('Invalid client id');
            }

            if (model.client.clientSecret !== clientSecret) {
                throw new Error('Invalid client secret');
            }

            // Validate redirect uri
            if (model.redirectUri !== redirectUri) {
                throw new Error('Invalid redirect uri');
            }

            // Validate code
            if (model.authCode.created_at.getTime() + model.authCode.expires_in * 1000 < new Date().getTime() + self.authCodeLifetimeInSeconds * 1000) {
                throw new Error('Code has expired');
            }

            const accessToken = new AccessToken("Bearer", self.accessTokenLifetimeInSeconds, self.generateAccessToken(), self.generateAccessToken(), new Date());

            return accessToken;
        });
    }

    private generateAuthCode(): string {
        return '123';
    }

    private generateAccessToken(): string {
        return '123';
    }
}