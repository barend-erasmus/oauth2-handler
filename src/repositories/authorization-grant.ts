// Imports
import * as co from 'co';
import * as mongo from 'mongodb';

// Imports models
import { AuthorizationGrant } from './../models/grants/authorization';

export class AuthorizationGrantRepository {

    private mongoUri: string = 'mongodb://mongo:27017/oauth2_handler';

    public findByAuthorizationResponseCode(code: string): Promise<AuthorizationGrant> {
        const self = this;

        return co(function*() {
            const db: mongo.Db = yield mongo.MongoClient.connect(self.mongoUri);

            const collection: mongo.Collection = db.collection('authorization_grants');

            const json: AuthorizationGrant = yield collection.findOne({
                'authorizationResponse.code': code
                ,
            });

            return json ? AuthorizationGrant.fromJson(json) : null;
        });
    }

    public findById(id: string): Promise<AuthorizationGrant> {
        const self = this;

        return co(function*() {
            const db: mongo.Db = yield mongo.MongoClient.connect(self.mongoUri);

            const collection: mongo.Collection = db.collection('authorization_grants');

            const json: AuthorizationGrant = yield collection.findOne({
                id,
            });

            return json ? AuthorizationGrant.fromJson(json) : null;
        });
    }

    public findByTokenResponseAccessToken(access_token: string): Promise<AuthorizationGrant> {
        const self = this;

        return co(function*() {
            const db: mongo.Db = yield mongo.MongoClient.connect(self.mongoUri);

            const collection: mongo.Collection = db.collection('authorization_grants');

            const json: AuthorizationGrant = yield collection.findOne({
                'tokenResponse.access_token': access_token,
            });

            return json ? AuthorizationGrant.fromJson(json) : null;
        });
    }

    public save(authorizationGrant: AuthorizationGrant): Promise<boolean> {
        const self = this;

        return co(function*() {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.mongoUri);

            const collection: mongo.Collection = db.collection('authorization_grants');

            const item: AuthorizationGrant = yield collection.findOne({
                id: authorizationGrant.id,
            });

            if (item) {
                const a = yield collection.updateOne({
                    id: authorizationGrant.id
  ,              }, authorizationGrant.toJson());
            } else {
                yield collection.insertOne(authorizationGrant.toJson());
            }

            return true;
        });
    }
}
