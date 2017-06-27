// Imports models
import { Client } from './../models/client';

export class ClientRepository {
    constructor() {

    }

    public findById(id: string): Promise<Client> {
        // return Promise.resolve(new Client('Euromonitor', '0mfgml8jqgpy7gpy6etlpl', 'dpzr2ezhd0gxrz8tosq239', ['http://192.168.46.112/oauth/passport/callback']));
        return Promise.resolve(new Client('Euromonitor', '0mfgml8jqgpy7gpy6etlpl', 'dpzr2ezhd0gxrz8tosq239', ['http://localhost:3000/passport/callback']));
    }
}
