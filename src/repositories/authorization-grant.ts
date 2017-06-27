// Imports
import { AuthorizationGrant } from './../models/grants/authorization';

export class AuthorizationGrantRepository {

    private static authorizationGrants: AuthorizationGrant[] = [];

    public findByAuthorizationResponseCode(code: string): Promise<AuthorizationGrant> {
        const item: AuthorizationGrant = AuthorizationGrantRepository.authorizationGrants.filter((x) => x.authorizationResponse).find((x) => x.authorizationResponse.code === code);
        return Promise.resolve(item);
    }

    public findById(id: string): Promise<AuthorizationGrant> {
        const item: AuthorizationGrant = AuthorizationGrantRepository.authorizationGrants.find((x) => x.id === id);
        return Promise.resolve(item);
    }

    public findByTokenResponseAccessToken(access_token: string): Promise<AuthorizationGrant> {
        const item: AuthorizationGrant = AuthorizationGrantRepository.authorizationGrants.filter((x) => x.tokenResponse).find((x) => x.tokenResponse.access_token === access_token);
        return Promise.resolve(item);
    }

    public save(authorizationGrant: AuthorizationGrant): Promise<boolean> {
        const item: AuthorizationGrant = AuthorizationGrantRepository.authorizationGrants.filter((x) => x.authorizationResponse).find((x) => x.id === authorizationGrant.id);

        if (item) {
            item.authorizationRequest = authorizationGrant.authorizationRequest;
            item.authorizationResponse = authorizationGrant.authorizationResponse;
            item.tokenRequest = authorizationGrant.tokenRequest;
            item.tokenResponse = authorizationGrant.tokenResponse;
            item.user = authorizationGrant.user;
        } else {
            AuthorizationGrantRepository.authorizationGrants.push(authorizationGrant);
        }

        return Promise.resolve(true);
    }
}