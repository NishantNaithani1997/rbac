import * as express from "express";
import { IAuthConfig, IRule } from './types';
import AuthorizationManager from './authorization/AuthorizationManager';

export default class AuthManager {

  private static instance: AuthManager;
  private static config: IAuthConfig;
	private static permissions: IRule[];
	private static authorizationManager: AuthorizationManager;

  static getInstance(): AuthManager {
		if (!AuthManager.instance) {
			AuthManager.instance = new AuthManager();
		}

		return AuthManager.instance;
	}


	init = (rules: IRule[], configurations: IAuthConfig) => {
    AuthManager.permissions = rules;
		AuthManager.config = configurations;
		AuthManager.authorizationManager = AuthorizationManager.getInstance();
	}


	auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {

		try {

			const { baseUrl, path, method } = req;
			const { locals: { userData } } = res;

			const requestData = {
				baseUrl,
				path,
				method: method.toUpperCase()
			}

			if (AuthManager.config.active) {
				if (AuthManager.permissions.length) {
					const authorized: boolean = AuthManager.authorizationManager.authorize(AuthManager.permissions, userData, requestData);
					if (authorized) {

						return next();
					}

					return res.json(new Error('User is not authorized for the particular route'));

				} else if (AuthManager.config.allowWhenNoRule) {

					return next();
				} else {

					return res.json(new Error('Access is denied for all the routes of this service'));
				}

			} else {

				return next();
			}
		} catch (err) {
			return res.json(new Error('Got some issues while authorizing user'));
		}
	}

}