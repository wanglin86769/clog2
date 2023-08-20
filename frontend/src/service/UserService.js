import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';

const authenticationService = new AuthenticationService();

export default class UserService {

	findUsers(filters) {
		let url = `${config.serverPath}/users`;
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

	findUser(_id) {
        let url = `${config.serverPath}/users/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findUserByEmail(email) {
        let url = `${config.serverPath}/users/email/${email}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	generateToken(expiration) {
		let url = `${config.serverPath}/users/token?expiration=${expiration}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addUser(user) {
		let url = `${config.serverPath}/users`;
		return axios.post(url, user, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	updateUser(_id, user) {
		let url = `${config.serverPath}/users/${_id}`;
		return axios.put(url, user, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	deleteUser(_id) {
		let url = `${config.serverPath}/users/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}
	
}