// Imports
import * as co from 'co';
import * as uuid from 'uuid';

// Imports models
import { Client } from './../models/client';
import { AuthorizationGrant } from './../models/grants/authorization';
import { AuthorizationRequest } from './../models/requests/authorization';
import { TokenRequest } from './../models/requests/token';
import { AuthorizationResponse } from './../models/responses/authorization';
import { TokenResponse } from './../models/responses/token';

// Imports repositories
import { AuthorizationGrantRepository } from './../repositories/authorization-grant';
import { ClientRepository } from './../repositories/client';

export class AuthorizationGrantService {

    private authorizationGrantRepository: AuthorizationGrantRepository = new AuthorizationGrantRepository();
    private clientRepository: ClientRepository = new ClientRepository();

    constructor() {

    }

    public create(response_type: string, client_id: string, redirect_uri: string, scope: string, state: string): Promise<AuthorizationGrant> {
        const self = this;

        return co(function*() {

            const client: Client = yield self.clientRepository.findById(client_id);

            if (!client) {
                throw new Error('Invalid client_id');
            }

            if (client.redirectUris.indexOf(redirect_uri) === -1) {
                throw new Error('Invalid redirect_uri');
            }

            const authorizationGrant = new AuthorizationGrant(uuid.v4(), 60, 60);

            authorizationGrant.authorizationRequest = new AuthorizationRequest(response_type, client_id, redirect_uri, scope, state, new Date().getTime());

            authorizationGrant.authorizationRequest.validate();

            if (authorizationGrant.authorizationRequest.hasExpiried(60)) {
                throw new Error('authorizationRequest has expired');
            }

            yield self.authorizationGrantRepository.save(authorizationGrant);

            return authorizationGrant;
        });
    }

    public setAuthorizationResponse(id: string, user: any): Promise<AuthorizationGrant> {

        const self = this;

        return co(function*() {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findById(id);

            if (!authorizationGrant) {
                throw new Error('Invalid id');
            }

            authorizationGrant.user = user;

            authorizationGrant.authorizationResponse = authorizationGrant.authorizationRequest.toResponse();

            authorizationGrant.authorizationResponse.validate();

            yield self.authorizationGrantRepository.save(authorizationGrant);

            return authorizationGrant;
        });
    }

    public setTokenResponse(grant_type: string, client_id: string, client_secret: string, code: string, redirect_uri: string): Promise<AuthorizationGrant> {

        const self = this;

        return co(function*() {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findByAuthorizationResponseCode(code);

            if (!authorizationGrant) {
                throw new Error('Invalid code');
            }

            authorizationGrant.tokenRequest = new TokenRequest(grant_type, client_id, client_secret, code, redirect_uri, new Date().getTime());

            authorizationGrant.tokenRequest.validate();

            if (authorizationGrant.authorizationResponse.hasExpiried(authorizationGrant.authorizationResponseExpiry)) {
                throw new Error('authorizationResponse has expired');
            }

            authorizationGrant.tokenResponse = authorizationGrant.tokenRequest.toResponse();

            authorizationGrant.tokenResponse.validate();

            yield self.authorizationGrantRepository.save(authorizationGrant);

            return authorizationGrant;
        });
    }

    public getByAccessToken(access_token: string): Promise<any> {
        const self = this;

        return co(function*() {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findByTokenResponseAccessToken(access_token);

            if (!authorizationGrant) {
                throw new Error('Invalid access_token');
            }

            authorizationGrant.tokenRequest.validate();

            if (authorizationGrant.tokenResponse.hasExpiried(authorizationGrant.tokenResponseExpiry)) {
                throw new Error('tokenResponse has expired');
            }

            return authorizationGrant.user;
        });
    }

    public getById(id: string): Promise<any> {
        const self = this;

        return co(function*() {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findById(id);

            if (!authorizationGrant) {
                throw new Error('Invalid id');
            }

            return authorizationGrant;
        });
    }

    public validateToken(access_token: string): Promise<boolean> {
        const self = this;

        return co(function*() {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findByTokenResponseAccessToken(access_token);

            if (!authorizationGrant) {
                throw new Error('Invalid access_token');
            }

            try {
                authorizationGrant.tokenRequest.validate();
            } catch (err) {
                return false;
            }

            if (authorizationGrant.tokenResponse.hasExpiried(authorizationGrant.tokenResponseExpiry)) {
                return false;
            }

            return true;
        });
    }
}
