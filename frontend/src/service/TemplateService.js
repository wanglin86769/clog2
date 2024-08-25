import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';

const authenticationService = new AuthenticationService();

export default class TemplateService {

	findTemplates() {
		let url = `${config.serverPath}/templates`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findTemplate(_id) {
        let url = `${config.serverPath}/templates/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addTemplate(template) {
		let url = `${config.serverPath}/templates`;
		return axios.post(url, template, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	updateTemplate(_id, template) {
		let url = `${config.serverPath}/templates/${_id}`;
		return axios.put(url, template, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	deleteTemplate(_id) {
		let url = `${config.serverPath}/templates/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}
	
}