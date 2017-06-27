export class Client {
    constructor(
        public name: string,
        public id: string,
        public secret: string,
        public redirectUris: string[],
    ) {

    }
}
