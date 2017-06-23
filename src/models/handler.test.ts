// Imports
import { expect } from 'chai';
import * as co from 'co';
import 'mocha';
import * as sinon from 'sinon';

// Imports models
import { AuthCode } from './authCode';
import { Client } from './client';
import { User } from './user';
import { Model } from './model';

// Imports handler
import { Handler } from './handler';

// https://alexbilbie.com/guide-to-oauth-2-grants/

describe('Handler', () => {

    describe('authorizationCodeGrantCode', () => {

        let handler: Handler = null;

        beforeEach(() => {
            handler = new Handler(
                (clientId: string) => {
                    return Promise.resolve(new Client('client', 'clientId', 'clientSecret', ['redirectUri'], ['scope']));
                },
                (clientId: string, username: string, password: string) => {
                    return Promise.resolve(new User('userId', 'username', ['scope'], null));
                },
                (model: Model) => {
                    return Promise.resolve();
                },
                (code: string) => {
                    return Promise.resolve(null);
                },
                [],
                3600,
                3600,
                3600,
                true
            );
        });

        it('should given valid response type returns auth code', () => {

            return co(function*() {
                const result: AuthCode = yield handler.authorizationCodeGrantCode('code', 'clientId', 'redirectUri', ['scope'], 'state', 'username', 'password');

                expect(result).to.be.not.null;
            });
        });

        it('should given invalid response type throws exception', () => {

            return co(function*() {

                try {
                const result: AuthCode = yield handler.authorizationCodeGrantCode('invalidresponsetype', 'clientId', 'redirectUri', ['scope'], 'state', 'username', 'password');
                throw new Error('Expected Exception');
                }catch(err) {
                    expect(err.message).to.be.eq('Invalid response type');
                }
                
            });
        });
    });

});