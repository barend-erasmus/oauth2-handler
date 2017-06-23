export class AuthCode {
    constructor(public code: string, public expires_in: number, public state: string, public created_at: Date) {

    }
}