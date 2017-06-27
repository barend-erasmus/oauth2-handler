// Imports
import { TokenGenerator } from './../../token-generator';

// Imports responses
import { AuthorizationResponse } from './../responses/authorization';

export class AuthorizationRequest {
    constructor(
        public response_type: string,
        public client_id: string,
        public redirect_uri: string,
        public scope: string,
        public state: string,
        public created_at: number,
    ) {

    }

    public toResponse(): AuthorizationResponse {
        return new AuthorizationResponse(TokenGenerator.generate(), this.state, new Date().getTime());
    }

    public hasExpiried(expiryInSeconds: number): boolean {
        const diff = new Date().getTime() - this.created_at;
        return  diff < 0 || diff > (expiryInSeconds * 1000);
    }

    public validate() {
        if (this.response_type !== 'code') {
            throw new Error('Invalid response_type');
        }

        if (!this.client_id) {
            throw new Error('Invalid client_id');
        }

        if (!this.redirect_uri) {
            throw new Error('Invalid redirect_uri');
        }
    }

    public toJson(): any {
        return {
            response_type: this.response_type,
            client_id: this.client_id,
            redirect_uri: this.redirect_uri,
            scope: this.scope,
            state: this.state,
            created_at: this.created_at,
        };
    }

    public static fromJson(json: AuthorizationRequest): AuthorizationRequest {
        const item = new AuthorizationRequest(json.response_type, json.client_id, json.redirect_uri, json.scope, json.state, json.created_at);

        return item;
    }
}
