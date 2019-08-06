import * as express from "express";
import { IAuthConfig, IRule } from './types';
import AuthorizationManager from './authorization/AuthorizationManager';

class AuthManager {

  private static config: IAuthConfig;
	private static permissions: IRule[];

	/**
	 * Method for intialising the package
	 * @param rules Array of rules/permissions a service want top restrict access
	 * @param configurations Configurations
	 */
	public init = (rules: IRule[], configurations: IAuthConfig) => {
    AuthManager.permissions = rules;
		AuthManager.config = configurations;
	}

	/**
	 * Method for returning the authorization result
	 * @param req Request object
	 * @param res Response object
	 * @param next Next will be the transfer of the response to the next function
	 */
	public auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {

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
					const authorized: boolean = AuthorizationManager.authorize(AuthManager.permissions, userData, requestData);

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

export default new AuthManager();