import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';

const authenticationService = new AuthenticationService();

export default class TagService {

	findTags() {
		let url = `${config.serverPath}/tags`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findTag(_id) {
        let url = `${config.serverPath}/tags/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addTag(tag) {
		let url = `${config.serverPath}/tags`;
		return axios.post(url, tag, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	updateTag(_id, tag) {
		let url = `${config.serverPath}/tags/${_id}`;
		return axios.put(url, tag, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	deleteTag(_id) {
		let url = `${config.serverPath}/tags/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}
	
}