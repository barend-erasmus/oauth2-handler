// Imports
import * as co from 'co';

// Imports models
import { Client } from './../models/client';

// Imports repositories
import { ClientRepository } from './../repositories/client';

export class ClientService {

    private clientRepository: ClientRepository = new ClientRepository();

    constructor() {

    }

    public get(client_id: string): Promise<Client> {
        const self = this;

        return co(function* () {
            const client: Client = yield self.clientRepository.findById(client_id);

            if (!client) {
                throw new Error('Invalid client_id');
            }

            return client;
        });
    }
}
