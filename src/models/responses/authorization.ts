export class AuthorizationResponse {
    constructor(
        public code: string,
        public state: string,
        public created_at: number
    ) {

    }

    public hasExpiried(expiryInSeconds: number): boolean {
        const diff = new Date().getTime() - this.created_at;
        return  diff < 0 || diff > (expiryInSeconds * 1000);
    }

    public validate() {
        if (!this.code) {
            throw new Error('Invalid code');
        }
    }
}