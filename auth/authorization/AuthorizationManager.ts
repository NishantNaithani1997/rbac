import { IRule, IUserDetails, IRequestDetails } from '../types';

export default class AuthorizationManager {

	private static instance: AuthorizationManager;
	private static config: any;


	static getInstance (): AuthorizationManager {
		if (!AuthorizationManager.instance) {
			AuthorizationManager.instance = new AuthorizationManager();
		}
		return AuthorizationManager.instance;
	}

	authorize = (permissions: IRule[], userDetails: IUserDetails, reqDetails: IRequestDetails) => {

		const { baseUrl, path, method } = reqDetails;
		const { userRoles } = userDetails;

		const requestedPath = baseUrl + path;
		const pathRegex = new RegExp(requestedPath);

		permissions = this.simplifyRules(permissions);

		let matchedRule;
		permissions.forEach((rule) => {
			if (rule.methods.includes(method) && pathRegex.exec(rule.route)) {
				matchedRule = rule;
			}
		});


		if (typeof matchedRule && matchedRule) {
			const { allow } = matchedRule;

			const auth = Object.keys(allow).every((key) => {
				if (userRoles.hasOwnProperty(key)) {
					if (Array.isArray(allow[key])) {
						return allow[key].includes(userRoles[key]);
					}
				}
				return false;
			});

			return auth;
		}

		return false;
	}

	private simplifyRules = (rules: any) => {
		const data = rules.map((rule: any) => {
			const { allow } = rule;
			Object.keys(allow).forEach((key: any) => {
				allow[key] = this.simplifyAllow(allow[key]);
			})
			return rule;
		});
		return data;
	}

	private simplifyAllow = (condition: string) => {
		return condition.split('||').map(item => item.trim().toLowerCase());
	}

}