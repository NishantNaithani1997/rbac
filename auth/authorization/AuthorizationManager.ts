import { IRule, IUserDetails, IRequestDetails } from '../types';

class AuthorizationManager {

	/**
	 * Method for returning the final result in boolean value
	 * @param permissions Array of rules a service added for restricting the access
	 * @param userDetails User details containg the roles assigned to him/her
	 * @param reqDetails Details of the request by which a specific rule will be verified for the user details
	 */
	authorize = (permissions: IRule[], userDetails: IUserDetails, reqDetails: IRequestDetails) => {

		const { baseUrl, path, method } = reqDetails;
		const { userRoles } = userDetails;

		if (!(typeof userRoles && userRoles)) {
			return false;
		}

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

	/**
	 * Method for simplyfing the details in rules
	 * @param rules Array of rules
	 */
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

	/**
	 * Method for simplifying the allow field of a rule
	 * @param condition String with '||' separator
	 */
	private simplifyAllow = (condition: string) => {
		return condition.split('||').map(item => item.trim().toLowerCase());
	}

}

export default new AuthorizationManager();