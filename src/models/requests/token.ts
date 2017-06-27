// Imports
import * as uuid from 'uuid';

// Imports responses
import { TokenResponse } from './../responses/token';

export class TokenRequest {
    constructor(
        public grant_type: string,
        public client_id: string,
        public client_secret: string,
        public code: string,
        public redirect_uri: string,
        public created_at: number
    ) {

    }

    public toResponse(): TokenResponse {
        return new TokenResponse(uuid.v4(), uuid.v4(), uuid.v4(), 'Bearer', new Date().getTime());
    }

    public hasExpiried(expiryInSeconds: number): boolean {
        const diff = new Date().getTime() - this.created_at;
        return  diff < 0 || diff > (expiryInSeconds * 1000);
    }

    public validate() {
        if (this.grant_type !== 'authorization_code') {
            throw new Error('Invalid grant_type');
        }

        if (!this.client_id) {
            throw new Error('Invalid client_id');
        }

        if (!this.client_secret) {
            throw new Error('Invalid client_secret');
        }

        if (!this.code) {
            throw new Error('Invalid code');
        }

        if (!this.redirect_uri) {
            throw new Error('Invalid redirect_uri');
        }
    }
    
}