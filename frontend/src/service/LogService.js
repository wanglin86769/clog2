import axios from 'axios';
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';
import {
    Bold,
    Essentials,
    Heading,
    Indent,
    IndentBlock,
    Italic,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    Table,
	TableCellProperties,
	TableProperties,
	TableToolbar,
    Undo,
    Image,
	ImageStyle,
	ImageTextAlternative,
    ImageCaption,
    ImageInsert,
    ImageResize,
    LinkImage,
    SimpleUploadAdapter,
	SourceEditing,
	Font,
	Underline,
} from 'ckeditor5';

const authenticationService = new AuthenticationService();

export default class LogService {

	// static categories = [ 'Info', 'Problem', 'Request', 'Suggestion', 'Urgent' ];
	static encodings = [ 'HTML', 'plain' ];

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

	findFirstLog(_id) {
        let url = `${config.serverPath}/logs/first/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findLastLog(_id) {
        let url = `${config.serverPath}/logs/last/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findPreviousLog(_id) {
        let url = `${config.serverPath}/logs/previous/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	findNextLog(_id) {
        let url = `${config.serverPath}/logs/next/${_id}`;
		return axios.get(url, {headers: authenticationService.authHeader()}).then(res => res.data);
	}

	saveLog(log) {
		let url = `${config.serverPath}/logs/save`;
		return axios.post(url, log, {headers: authenticationService.authHeader()}).then(res => res.data);
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
				// icon = require('@/assets/images/word.png');
				icon = new URL('@/assets/images/word.png', import.meta.url).href
				break;
			case 'xls':
			case 'xlsx':
				// icon = require('@/assets/images/excel.png');
				icon = new URL('@/assets/images/excel.png', import.meta.url).href
				break;
			case 'ppt':
			case 'pptx':
				// icon = require('@/assets/images/powerpoint.png');
				icon = new URL('@/assets/images/powerpoint.png', import.meta.url).href
				break;
			case 'pdf':
				// icon = require('@/assets/images/pdf.png');
				icon = new URL('@/assets/images/pdf.png', import.meta.url).href
				break;
			case 'mp4':
				// icon = require('@/assets/images/mp4.png');
				icon = new URL('@/assets/images/mp4.png', import.meta.url).href
				break;
			default:
				// icon = require('@/assets/images/fileIcon.png');
				icon = new URL('@/assets/images/fileIcon.png', import.meta.url).href
				break;
		}
		return icon;
	}

	findAttachment(logId, fileName) {
		let url = `${config.serverPath}/logs/attachments/${logId}/${fileName}`;
		return axios.get(url, {headers: authenticationService.authHeader(), responseType: 'blob'}).then(res => res.data);
	}

	generateRichTextConfig(showToolbar) {
		return {
			toolbar: {
				items: showToolbar ? [
					'undo', 'redo', '|', 'sourceEditing', '|', 'heading', '|', 
					'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', 'bold', 'italic', 'underline', '|',
					'link', 'insertTable', 'mediaEmbed', '|',
					'bulletedList', 'numberedList', 'indent', 'outdent', '|',
					'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
					'insertImage', 'toggleImageCaption', 'imageTextAlternative'
				] : null,
				shouldNotGroupWhenFull: true, // Make the toolbar responsive
			},
			plugins: [
				Bold,
				Essentials,
				Heading,
				Indent,
				IndentBlock,
				Italic,
				Link,
				List,
				MediaEmbed,
				Paragraph,
				Table,
				TableCellProperties,
				TableProperties,
				TableToolbar,
				Undo,
				Image,	
				ImageStyle,
				ImageTextAlternative,

				ImageCaption, // adds ability to caption image via the toolbar
				ImageInsert,
				ImageResize, // this will cause resize handles to appear in the editor, operates by applying CSS to the enclosing <figure> tag
				LinkImage,
				SimpleUploadAdapter,

				SourceEditing,
				Font,
				Underline,
			],
			table: {
				contentToolbar: [
					'tableColumn', 'tableRow', 'mergeTableCells',
					'tableProperties', 'tableCellProperties'
				],
				tableProperties: {
					// The configuration of the TableProperties plugin.
					// ...
				},
				tableCellProperties: {
					// The configuration of the TableCellProperties plugin.
					// ...
				},
			},
			image: {
				styles: {
					options: [
						'inline', 'alignLeft', 'alignRight',
						'alignCenter', 'alignBlockLeft', 'alignBlockRight',
						'block', 'side'
					]
				}
			},
			simpleUpload: {
				// The URL that the images are uploaded to.
				uploadUrl: `${config.serverPath}/logs/richtext`,

				// Enable the XMLHttpRequest.withCredentials property.
				// withCredentials: true,

				// Headers sent along with the XMLHttpRequest to the upload server.
				headers: {
					'X-CSRF-TOKEN': 'CSRF-Token',
					...authenticationService.authHeader(),
				}
			}
		}
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