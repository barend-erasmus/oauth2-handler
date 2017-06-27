// Imports
import * as express from 'express';
import * as co from 'co';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import * as jsonwebtoken from 'jsonwebtoken';

// Imports middleware
import * as cookieParser from 'cookie-parser';
import * as jwt from 'express-jwt';
import * as bodyParser from 'body-parser';

// Imports services
import { AuthorizationGrantService } from './services/authorization-grant';

// Imports models
import { AuthorizationGrant } from './models/grants/authorization';
import { AuthorizationResponse } from './models/responses/authorization';

const app = express();
const authorizationGrantService: AuthorizationGrantService = new AuthorizationGrantService();

// Configure middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/login', jwt({
    secret: 'secret',
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }else if (req.cookies && req.cookies.token) {
            return req.cookies.token;
        }
        return null;
    }
}), (req: express.Request, res: express.Response) => {
    co(function* () {

        if (!req.query.id) {
            res.send('Require id');
            return;
        }

        if (req['user']) {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.setAuthorizationResponse(req.query.id, req['user']);

            res.redirect(`${authorizationGrant.authorizationRequest.redirect_uri}?code=${authorizationGrant.authorizationResponse.code}&state=${authorizationGrant.authorizationResponse.state}`);
            return;
        } else {
            renderPage(res, path.join(__dirname, 'login.html'), {
                id: req.query.id,
                name: 'Euromonitor',
                message: null
            }, 200);
            return;
        }
    });
});


app.post('/login', (req: express.Request, res: express.Response) => {
    co(function* () {

        if (!req.query.id) {
            res.send('Require id');
            return;
        }

        const user: any = {
            username: req.body.username
        };

        const token = jsonwebtoken.sign({ user }, 'secret');
        res.cookie('token', token);

        if (user) {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.setAuthorizationResponse(req.query.id, user);

            res.redirect(`${authorizationGrant.authorizationRequest.redirect_uri}?code=${authorizationGrant.authorizationResponse.code}&state=${authorizationGrant.authorizationResponse.state}`);
            return;
        } else {
            renderPage(res, path.join(__dirname, 'index.html'), {
                id: req.query.id,
                name: 'Euromonitor',
                message: null
            }, 200);
            return;
        }
    });
});

app.get('/authorize', (req: express.Request, res: express.Response) => {

    co(function* () {
        if (req.query.response_type === 'code') {
            const authorizationGrant: AuthorizationGrant = yield authorizationGrantService.create(req.query.response_type, req.query.client_id, req.query.redirect_uri, req.query.scope, req.query.state);

            res.redirect(`/login?id=${authorizationGrant.id}`);
        } else {
            res.send('Invalid response_code');
        }

    });
});


function renderPage(res: express.Response, htmlFile: string, data: any, status: number): void {

    fs.readFile(htmlFile, 'utf8', (err: Error, html: string) => {
        if (err) {
            return;
        }

        const template = Handlebars.compile(html);

        const result = template(data);

        res.status(status).send(result);

    });
}

app.listen(3000, () => {

});