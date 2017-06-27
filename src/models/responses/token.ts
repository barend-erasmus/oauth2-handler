export class TokenResponse {
    constructor(
        public access_token: string,
        public refresh_token: string,
        public id_token: string,
        public token_type: string,
        public created_at: number
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
}