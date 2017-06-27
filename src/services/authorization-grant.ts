// Imports
import * as co from 'co';
import * as uuid from 'uuid';

// Imports models
import { AuthorizationGrant } from './../models/grants/authorization';
import { AuthorizationRequest } from './../models/requests/authorization';
import { TokenRequest } from './../models/requests/token';
import { AuthorizationResponse } from './../models/responses/authorization';
import { TokenResponse } from './../models/responses/token';

// Imports repositories
import { AuthorizationGrantRepository } from './../repositories/authorization-grant';

export class AuthorizationGrantService {

    private authorizationGrantRepository: AuthorizationGrantRepository = new AuthorizationGrantRepository();

    constructor() {

    }

    public create(response_type: string, client_id: string, redirect_uri: string, scope: string, state: string): Promise<AuthorizationGrant> {
        const self = this;

        return co(function* () {
            const authorizationGrant = new AuthorizationGrant(uuid.v4(), 60, 60);

            authorizationGrant.authorizationRequest = new AuthorizationRequest(response_type, client_id, redirect_uri, scope, state, new Date().getTime());

            if (authorizationGrant.authorizationRequest.hasExpiried(60)) {
                throw new Error('authorizationRequest has expired');
            }

            yield self.authorizationGrantRepository.save(authorizationGrant);

            return authorizationGrant;
        });
    }

    public setAuthorizationResponse(authorizationGrantId: string, user: any): Promise<AuthorizationGrant> {

        const self = this;

        return co(function* () {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findById(authorizationGrantId);

            if (!authorizationGrant) {
                throw new Error('Invalid id');
            }

            authorizationGrant.user = user;

            authorizationGrant.authorizationResponse = authorizationGrant.authorizationRequest.toResponse();

            yield self.authorizationGrantRepository.save(authorizationGrant);

            return authorizationGrant;
        });
    }

    public getTokenResponse(grant_type: string, client_id: string, client_secret: string, code: string, redirect_uri: string): Promise<TokenResponse> {

        const self = this;

        return co(function* () {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findByAuthorizationResponseCode(code);

            authorizationGrant.tokenRequest = new TokenRequest(grant_type, client_id, client_secret, code, redirect_uri, new Date().getTime());

            authorizationGrant.tokenRequest.validate();

            if (authorizationGrant.authorizationResponse.hasExpiried(authorizationGrant.authorizationResponseExpiry)) {
                throw new Error('authorizationResponse has expired');
            }

            authorizationGrant.tokenResponse = authorizationGrant.tokenRequest.toResponse();

            return authorizationGrant.tokenResponse;
        });
    }

    public validateToken(access_token: string): Promise<boolean> {
        const self = this;

        return co(function* () {
            const authorizationGrant: AuthorizationGrant = yield self.authorizationGrantRepository.findByTokenResponseAccessToken(access_token);

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