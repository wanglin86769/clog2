import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';

const authenticationService = new AuthenticationService();

export default class LogService {

	static categories = [ 'Info', 'Problem', 'Request', 'Suggestion', 'Urgent' ];

	findLastActive(logbook) {
        let url = `${config.serverPath}/logs/lastactive?logbook=${logbook}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findLogs(logbook, lazyParams) {
		let url = `${config.serverPath}/logs`;
		return axios.get(url, {headers: authenticationService.authHeader(), params: {logbook: logbook, lazyEvent: JSON.stringify(lazyParams)}}).then(res => res.data);
	}

	findLog(_id) {
        let url = `${config.serverPath}/logs/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	addLogFormData(formData) {
		let url = `${config.serverPath}/logs`;
		return axios.post(url, formData, {
			headers:  {
				...authenticationService.authHeader(),
				'Content-Type': 'multipart/form-data'
			}
		}).then(res => res.data);
	}

	editLogFormData(_id, formData) {
		let url = `${config.serverPath}/logs/${_id}`;
		return axios.put(url, formData, {
			headers: {
				...authenticationService.authHeader(),
				'Content-Type': 'multipart/form-data'
			}
		}).then(res => res.data);
	}

	deleteLog(_id) {
		let url = `${config.serverPath}/logs/${_id}`;
		return axios.delete(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	attachmentUrl(logId, fileName) {
		let url = `${config.serverPath}/logs/attachments/${logId}/${fileName}`;
		return url;
	}

	attachmentIcon(fileName) {
		let icon;
		let extension = fileName.split('.').pop();
		switch(extension) {
			case 'doc':
			case 'docx':
				icon = require('@/assets/images/word.png');
				break;
			case 'xls':
			case 'xlsx':
				icon = require('@/assets/images/excel.png');
				break;
			case 'ppt':
			case 'pptx':
				icon = require('@/assets/images/powerpoint.png');
				break;
			case 'pdf':
				icon = require('@/assets/images/pdf.png');
				break;
			case 'mp4':
				icon = require('@/assets/images/mp4.png');
				break;
			default:
				icon = require('@/assets/images/fileIcon.png');
				break;
		}
		return icon;
	}

	findAttachment(logId, fileName) {
		let url = `${config.serverPath}/logs/attachments/${logId}/${fileName}`;
		return axios.get(url, {headers: authenticationService.authHeader(), responseType: 'blob'}).then(res => res.data);
	}

	validate(log) {
		let validity = { valid: true, message: null };
		
		if(!log.logbook) {
			validity = { valid: false, message: `Logbook cannot be empty` };
			return validity;
		}
		if(!log.category) {
			validity = { valid: false, message: `Category cannot be empty` };
			return validity;
		}
		if(!log.title) {
			validity = { valid: false, message: `Title cannot be empty` };
			return validity;
		}
		if(!log.description) {
			validity = { valid: false, message: `Content cannot be empty` };
			return validity;
		}

		return validity;
	}

}