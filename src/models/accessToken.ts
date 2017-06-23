export class AccessToken {
    constructor(
        public token_type: string,
        public expires_in: number,
        public access_token: string,
        public refresh_token: string,
        public created_at: Date
    ) {

    }
}