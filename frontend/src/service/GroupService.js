import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';

const authenticationService = new AuthenticationService();

export default class GroupService {

	findGroups() {
		let url = `${config.serverPath}/groups`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findGroup(_id) {
        let url = `${config.serverPath}/groups/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addGroup(group) {
		let url = `${config.serverPath}/groups`;
		return axios.post(url, group, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	updateGroup(_id, group) {
		let url = `${config.serverPath}/groups/${_id}`;
		return axios.put(url, group, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	deleteGroup(_id) {
		let url = `${config.serverPath}/groups/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}
	
}