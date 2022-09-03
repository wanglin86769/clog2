import axios from 'axios';
import config from '../config/configuration.js';
import AuthenticationService from './AuthenticationService';

const authenticationService = new AuthenticationService();

export default class AccountService {

	registerAccount(account) {
		let url = `${config.serverPath}/accounts/registeraccount`;
		return axios.post(url, account, {}).then(res => res.data);
	}

	verifyAccount(random) {
		let url = `${config.serverPath}/accounts/verifyaccount/${random}`;
		return axios.post(url, null, {}).then(res => res.data);
	}

	updatePassword(account) {
		let url = `${config.serverPath}/accounts/updatepassword/${account.email}`;
		return axios.post(url, account, {}).then(res => res.data);
	}

	forgetPassword(account) {
		let url = `${config.serverPath}/accounts/forgetpassword/${account.email}`;
		return axios.post(url, account, {}).then(res => res.data);
	}

	resetPassword(random, account) {
		let url = `${config.serverPath}/accounts/resetpassword/${random}`;
		return axios.post(url, account, {}).then(res => res.data);
	}

	findAccounts(filters) {
		let url = `${config.serverPath}/accounts`;
		if(filters === undefined) return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);

		if(!(Object.entries(filters).length === 0 && filters.constructor === Object)) {
			// console.log(filters);
			for (const [key, value] of Object.entries(filters)) {
				if(typeof value === 'boolean' || value) {
					if(url.includes('?')) {
						url += `&${key}=${value}`;
					} else {
						url += `?${key}=${value}`;
					}
				}
			}
		}
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findAccount(_id) {
        let url = `${config.serverPath}/accounts/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addAccount(account) {
		let url = `${config.serverPath}/accounts`;
		return axios.post(url, account, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	updateAccount(_id, account) {
		let url = `${config.serverPath}/accounts/${_id}`;
		return axios.put(url, account, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	deleteAccount(_id) {
		let url = `${config.serverPath}/accounts/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}
	
}