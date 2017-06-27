export class TokenResponse {
    constructor(
        public access_token: string,
        public refresh_token: string,
        public id_token: string,
        public token_type: string,
        public created_at: number,
    ) {

    }

    public hasExpiried(expiryInSeconds: number): boolean {
        const diff = new Date().getTime() - this.created_at;
        return  diff < 0 || diff > (expiryInSeconds * 1000);
    }

    public validate() {
        if (!this.access_token) {
            throw new Error('Invalid access_token');
        }

        if (this.token_type !== 'Bearer') {
            throw new Error('Invalid token_type');
        }
    }

    public toJson(): any {
        return {
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            id_token: this.id_token,
            token_type: this.token_type,
            created_at: this.created_at,
        };
    }

    public static fromJson(json: TokenResponse): TokenResponse {
        const item = new TokenResponse(json.access_token, json.refresh_token, json.id_token, json.token_type, json.created_at);

        return item;
    }
}
