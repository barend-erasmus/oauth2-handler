// tslint --fix --exclude \"./src/**/[config|swagger]*.*\" ./src/**/*.ts
// http://localhost:3000/authorize?response_type=code&client_id=969fbcb3-7202-4f4b-a56e-b44f244ce48c&redirect_uri=http://localhost:3000/passport/callback&scope=read&state=40335

// Imports
import * as co from 'co';
import * as express from 'express';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as jsonwebtoken from 'jsonwebtoken';
import * as path from 'path';
import * as request from 'request-promise';
import * as winston from 'winston';

import * as ActiveDirectory from 'activedirectory';

// Imports middleware
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as jwt from 'express-jwt';
import * as expressWinston from 'express-winston';

// Imports services
import { AuthorizationGrantService } from './services/authorization-grant';
import { ClientService } from './services/client';

// Imports models
import { Client } from './models/client';
import { AuthorizationGrant } from './models/grants/authorization';
import { AuthorizationResponse } from './models/responses/authorization';

const app = express();
const authorizationGrantService: AuthorizationGrantService = new AuthorizationGrantService();
const clientService: ClientService = new ClientService();

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'debug' }),
        new (winston.transports.File)({
            filename: path.join(__dirname, 'requests.log'),
            level: 'debug',
        }),
    ],
});

// Configure middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressWinston.logger({
    msg: 'HTTP Request: {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
    meta: false,
    winstonInstance: logger,
}));

// Constants
const jwtSecretPublic = '-----BEGIN PUBLIC KEY-----\r\nMIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHzwFSFvJIA1xc3t8IlYtcrKzrk8\r\nNNiluBMmertMuvp4wzgAw9r6Frbn0dbeiXkUN4oQdjltZU/+lDRfyCuVwGuZyUuh\r\nnMVCO81pQRUiOIiF1BF8ziYJRb/1EVD72Hpyh9IV9sCH6Ev8+/zQjnxVZii5c4O1\r\nzOlgFzi7PPdo952HAgMBAAE=\r\n-----END PUBLIC KEY-----';
const jwtSecretPrivate = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICWgIBAAKBgHzwFSFvJIA1xc3t8IlYtcrKzrk8NNiluBMmertMuvp4wzgAw9r6\r\nFrbn0dbeiXkUN4oQdjltZU/+lDRfyCuVwGuZyUuhnMVCO81pQRUiOIiF1BF8ziYJ\r\nRb/1EVD72Hpyh9IV9sCH6Ev8+/zQjnxVZii5c4O1zOlgFzi7PPdo952HAgMBAAEC\r\ngYBtJbjwGo7CyzdhbmtjMfKvlXn/7Y8lbbFgWY+DLcdzpii2NkTkevN5GxEBLCzh\r\ncD4NCdCe3ulRd1C2aK8RFKSilqAUEpy2KSHR6fmzFSIpHmHUlHrF72rIPZN1g03f\r\nMWyUKMPECo6ZDJ4tiEZuqVBdgtUdjpvAUF9O5e2KAYVWUQJBAO5iyqbz8Ijds2SO\r\nq9eeboPrc3bJulr1L5OLJva8VCBTFpqWHrwXLTm0CIdVsmcV+lOBXTd/KgzIZ+ec\r\nw602ZZMCQQCGK1qzokEy2BL49P5DOAAEj3SHRs8GAvq+IpMMJontUQdTvoIFid4D\r\nTf1lgeiGUvDZj+MjjqYP35T34I2qGuC9AkBIclOeK3KFVcMoI0fMLoTtqIedqS7u\r\nZ6c+0sJTp+Z1MGslLcxHY0/GQpV4861VMNOzvxPiQs43tkwFkpnRMT/rAkBX/fT1\r\nXJNP6h+/QMXEheSVGRQ+Z/T8J1YU/o3b6SaKCps4k/en9DwzhKGMQf+ioKCuvswj\r\nlLlaLbMAQjgGeKwtAkB1sWqIx60HIz6yKe4i78AIPfA7kr04hKk+IDIJL0msT7me\r\niooQxf+mGiqYv0oZgGtTxgQ4HJtSnJaiheoNGIqK\r\n-----END RSA PRIVATE KEY-----';
const loginPagePath = path.join(__dirname, 'login.html');

app.get('/', (req: express.Request, res: express.Response) => {
    res.send(req.cookies.token);
});

app.get('/login', jwt({
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        } else if (req.cookies && req.cookies.token) {
            return req.cookies.token;
        }
        return null;
    },
    secret: jwtSecretPublic,
}), (req: express.Request, res: express.Response) => {
    co(function*() {

        if (!req.query.id) {
            res.send('Require id');
            return;
        }

        const user = req['user'] ? req['user'].user : null;

        if (user) {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.setAuthorizationResponse(req.query.id, user);

            res.redirect(`${authorizationGrant.authorizationRequest.redirect_uri}?code=${authorizationGrant.authorizationResponse.code}&state=${authorizationGrant.authorizationResponse.state}`);
            return;
        } else {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.getById(req.query.id);

            const client: Client = yield clientService.get(authorizationGrant.authorizationRequest.client_id);

            renderPage(res, loginPagePath, {
                id: req.query.id,
                message: null,
                name: client.name,
            }, 200);
            return;
        }
    }).catch((err: Error) => {
        logger.error(err.message, err);
        res.status(500).send(err.message);
    });
});

app.post('/login', (req: express.Request, res: express.Response) => {
    co(function*() {

        if (!req.query.id) {
            res.send('Require id');
            return;
        }

        const isCredentialsValid: boolean = yield validateCredentials(req.body.username, req.body.password);

        if (!isCredentialsValid) {

            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.getById(req.query.id);

            const client: Client = yield clientService.get(authorizationGrant.authorizationRequest.client_id);

            renderPage(res, path.join(__dirname, 'login.html'), {
                id: req.query.id,
                message: 'Invalid credentials',
                name: client.name,
            }, 200);
            return;
        }

        const user: any = {
            username: req.body.username,
        };

        const token = jsonwebtoken.sign({ user }, jwtSecretPrivate, { algorithm: 'RS256' });
        res.cookie('token', token);

        if (user) {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.setAuthorizationResponse(req.query.id, user);

            res.redirect(`${authorizationGrant.authorizationRequest.redirect_uri}?code=${authorizationGrant.authorizationResponse.code}&state=${authorizationGrant.authorizationResponse.state}`);
            return;
        } else {

            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.getById(req.query.id);

            const client: Client = yield clientService.get(authorizationGrant.authorizationRequest.client_id);

            renderPage(res, path.join(__dirname, 'index.html'), {
                id: req.query.id,
                message: null,
                name: client.name,
            }, 200);
            return;
        }
    }).catch((err: Error) => {
        logger.error(err.message, err);
        res.status(500).send(err.message);
    });
});

app.get('/authorize', (req: express.Request, res: express.Response) => {

    co(function*() {
        if (req.query.response_type === 'code') {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.create(req.query.response_type, req.query.client_id, req.query.redirect_uri, req.query.scope, req.query.state);

            res.redirect(`/login?id=${authorizationGrant.id}`);
        } else {
            res.send('Invalid response_code');
        }

    }).catch((err: Error) => {
        logger.error(err.message, err);
        res.status(500).send(err.message);
    });
});

app.get('/token', (req: express.Request, res: express.Response) => {

    co(function*() {
        if (req.query.grant_type === 'authorization_code') {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.setTokenResponse(req.query.grant_type, req.query.client_id, req.query.client_secret, req.query.code, req.query.redirect_uri);

            res.json(authorizationGrant.tokenResponse);
        } else {
            res.send('Invalid grant_type');
        }

    }).catch((err: Error) => {
        logger.error(err.message, err);
        res.status(500).send(err.message);
    });
});

app.get('/user', (req: express.Request, res: express.Response) => {
    co(function*() {

        if (!req.get('Authorization') || req.get('Authorization').split(' ')[0] !== 'Bearer') {
            throw new Error('Invalid header');
        }

        const access_token = req.get('Authorization').split(' ')[1];

        const user = yield authorizationGrantService.getByAccessToken(access_token);

        res.json(user);
    }).catch((err: Error) => {
        logger.error(err.message, err);
        res.status(500).send(err.message);
    });
});

app.get('/passport/callback', (req: express.Request, res: express.Response) => {

    const client_id = 'clientId';
    const client_secret = 'clientSecret';
    const redirect_uri = 'http://localhost:3000/passport/callback';
    const trinityApiUri = 'http://trinity.euromonitor.com';

    co(function*() {
        const response1 = yield request({
            method: 'GET',
            uri: `http://localhost:3000/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect_uri}`,
            json: true,
            resolveWithFullResponse: true,
        });

        if (response1.statusCode !== 200) {
            res.status(500).json({

            });
            return;
        }

        const response2 = yield request({
            method: 'GET',
            uri: `http://localhost:3000/user`,
            headers: {
                Authorization: `Bearer ${response1.body.access_token}`,
            },
            json: true,
            resolveWithFullResponse: true,
        });

        if (response2.statusCode !== 200) {
            res.status(500).json({

            });
            return;
        }

        const response3 = yield request({
            method: 'POST',
            uri: `${trinityApiUri}/api/auth/token`,
            body: {
                SubscriberId: req.query.state,
                Username: `EURO_NT\\${response2.body.username}`,
                ApplicationId: 1,
            },
            json: true,
            resolveWithFullResponse: true,
        });

        if (response3.statusCode !== 200) {

            res.status(500).json({

            });
            return;
        }

        res.redirect(`http://portal.euromonitor.com/Portal?ClearClaim=true&AuthToken=${response3.body}`);

    }).catch((err: Error) => {
        logger.error(err.message, err);
        res.status(500).send(err.message);
    });
});

function validateCredentials(username: string, password: string): Promise<boolean> {
    return new Promise((resolve: (result: boolean) => void, reject: (err: Error) => void) => {

        const configuration = {
            url: 'ldap://EUROCT1.euromonitor.local',
            baseDN: 'dc=euromonitor,dc=local',
            username: `${username}@euromonitor.local`,
            password,
        };

        const ad = new ActiveDirectory(configuration);

        ad.authenticate(`${username}@euromonitor.local`, password, (err: Error, auth: any) => {
            if (err) {
                resolve(false);
            } else if (auth) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}

function renderPage(res: express.Response, htmlFile: string, data: any, status: number): void {

    fs.readFile(htmlFile, 'utf8', (err: Error, html: string) => {
        if (err) {
            res.status(400).send(err.message);
            return;
        }

        const template = Handlebars.compile(html);

        const result = template(data);

        res.status(status).send(result);

    });
}

app.listen(3000, () => {
    logger.info('listening');
});
