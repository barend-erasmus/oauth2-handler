export class TokenGenerator {
    public static generate() {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    }
}
