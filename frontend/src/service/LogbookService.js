import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';

const authenticationService = new AuthenticationService();

export default class LogbookService {

	findLogbooks() {
		let url = `${config.serverPath}/logbooks`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findLogbooksDetail() {
		let url = `${config.serverPath}/logbooks/detail`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findLogbook(_id) {
        let url = `${config.serverPath}/logbooks/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addLogbook(logbook) {
		let url = `${config.serverPath}/logbooks`;
		return axios.post(url, logbook, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	updateLogbook(_id, logbook) {
		let url = `${config.serverPath}/logbooks/${_id}`;
		return axios.put(url, logbook, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	deleteLogbook(_id) {
		let url = `${config.serverPath}/logbooks/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}
	
}