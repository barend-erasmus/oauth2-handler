// Imports models
import { Client } from './client';
import { User } from './user';
import { AuthCode } from './authCode';
import { AccessToken } from './accessToken';

export class Model {
    constructor(
        public responseType: string,
        public grantType: string, 
        public client: Client,
        public user: User,
        public redirectUri: string,
        public scopes: string[],
        public state: string,
        public authCode: AuthCode,
        public accessToken: AccessToken
    ) {
        
    }
}