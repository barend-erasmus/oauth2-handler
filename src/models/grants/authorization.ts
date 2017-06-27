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
        public tokenResponseExpiry: number,
    ) {

    }

    public toJson(): any {
        return {
            id: this.id,
            authorizationResponseExpiry: this.authorizationResponseExpiry,
            tokenResponseExpiry: this.tokenResponseExpiry,
            authorizationRequest: this.authorizationRequest? this.authorizationRequest.toJson() : null,
            authorizationResponse: this.authorizationResponse? this.authorizationResponse.toJson() : null,
            tokenRequest: this.tokenRequest? this.tokenRequest.toJson() : null,
            tokenResponse: this.tokenResponse? this.tokenResponse.toJson() : null,
            user: this.user,
        };
    }

    public static fromJson(json: AuthorizationGrant): AuthorizationGrant {
        const item = new AuthorizationGrant(json.id, json.authorizationResponseExpiry, json.tokenResponseExpiry);
        item.authorizationRequest = json.authorizationRequest? AuthorizationRequest.fromJson(json.authorizationRequest) : null;
        item.authorizationResponse = json.authorizationResponse? AuthorizationResponse.fromJson(json.authorizationResponse) : null;
        item.tokenRequest = json.tokenRequest? TokenRequest.fromJson(json.tokenRequest) : null;
        item.tokenResponse = json.tokenResponse? TokenResponse.fromJson(json.tokenResponse) : null;
        item.user = json.user;

        return item;
    }
}
