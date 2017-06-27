// Imports
import * as uuid from 'uuid';

// Imports responses
import { AuthorizationResponse } from './../responses/authorization';

export class AuthorizationRequest {
    constructor(
        public response_type: string,
        public client_id: string,
        public redirect_uri: string,
        public scope: string,
        public state: string,
        public created_at: number
    ) {

    }

    public toResponse(): AuthorizationResponse {
        return new AuthorizationResponse(uuid.v4(), this.state, new Date().getTime());
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
}