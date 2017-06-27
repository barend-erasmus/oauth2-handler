export class AuthorizationResponse {
    constructor(
        public code: string,
        public state: string,
        public created_at: number,
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

    public toJson(): any {
        return {
            code: this.code,
            state: this.state,
            created_at: this.created_at,
        };
    }

    public static fromJson(json: AuthorizationResponse): AuthorizationResponse {
        const item = new AuthorizationResponse(json.code, json.state, json.created_at);

        return item;
    }
}
