import { IRule, IUserDetails, IRequestDetails } from '../types';

export default class AuthorizationManager {

	private static instance: AuthorizationManager;
	public static config: any;


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

		const matchedRule: any = permissions.forEach((rule) => {
			if (rule.methods.includes(method) && pathRegex.exec(rule.route) ) {
				return rule;
			}
			return false;
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
			// userRoles.hasOwnProperty(key) && allow[key] === userRoles[key] );			
			if (auth) {
				return false;
			}

			return true;
		}

		return false;
	}

	simplifyRules = (rules: any) => {
		return rules.map((rule: any) => {
			const { allow } = rule;
			Object.keys(allow).forEach((key: any) => {
				allow[key] = this.simplifyAllow(allow[key]);
			})
		});
	}

	simplifyAllow = (condition: string) => {
		return condition.split('||').map(item => item.trim().toLowerCase());
	}

}