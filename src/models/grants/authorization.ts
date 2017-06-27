// Imports requests
import { AuthorizationRequest } from './../requests/authorization';
import { TokenRequest } from './../requests/token';

// Imports responses
import { AuthorizationResponse } from './../responses/authorization';
import { TokenResponse } from './../responses/token';

export class AuthorizationGrant {

    public authorizationRequest: AuthorizationRequest;
    public authorizationResponse: AuthorizationResponse;
    public tokenRequest: TokenRequest;
    public tokenResponse: TokenResponse;
    public user: any;

    constructor(
        public id: string,
        public authorizationResponseExpiry: number,
        public tokenResponseExpiry: number
    ) {

    }
}