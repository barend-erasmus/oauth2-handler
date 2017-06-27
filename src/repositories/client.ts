// Imports models
import { Client } from './../models/client';

export class ClientRepository {
    constructor() {

    }

    public findById(id: string): Promise<Client> {
        return Promise.resolve(new Client('Euromonitor', 'clientid', 'clientsecret', ['http://localhost:3000/passport/callback']));
    }
}