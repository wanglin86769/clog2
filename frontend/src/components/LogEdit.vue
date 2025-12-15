<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Card class="shadow-2" style="margin-bottom: 2em;">
            <template #title>
                {{ $t('logedit_title') }}
				<Button style="float: right; background-color: Peru; border-color: Peru;" :label="$t('global_save')" icon="fa fa-save" size="small" severity="info" @click="saveLog" />
            </template>
            <!-- <template #subtitle>
                Subtitle
            </template> -->
            <template #content>
				<table border="1" width="100%">
                    <tr height="40em">
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_logbook') }}</span><span style="color: red"> *</span></td>
                        <td width="80%" align="left"><span v-if="currentLog && currentLog.logbook" style="margin-left: 0.8em;">{{ currentLog.logbook.name }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_tag') }}</span></td>
                        <td align="left">
							<MultiSelect style="min-width: 200px; margin-left: 0.4em;" v-model="log.tags" :options="tags" optionLabel="name" optionValue="_id" :placeholder="$t('global_select')" display="chip"/>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_category') }}</span><span style="color: red"> *</span></td>
                        <td align="left">
							<Dropdown style="min-width: 200px; margin-left: 0.4em;" v-model="log.category" :options="categories" :placeholder="$t('global_select')" />
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_title') }}</span><span style="color: red"> *</span></td>
                        <td align="left">
							<InputText style="min-width: 500px; margin-left: 0.4em;" type="text" v-model="log.title" placeholder=""/>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left" colspan="2" style="padding: 10px;">
							<!-- <Textarea v-model="log.description" :placeholder="$t('global_log_description_placeholder')" :autoResize="true" rows="5" style="width: 100%;" /> -->
							<div v-if="log.encoding === 'HTML'" spellcheck="false">
								<ckeditor :editor="editor" v-model="log.description" :config="editorConfig"></ckeditor>
							</div>
							<div v-else>
								<Textarea v-model="log.description" :placeholder="$t('global_log_description_placeholder')" :autoResize="true" rows="10" style="width: 100%;" />
							</div>
							<div style="margin-top: .8em;">
								<span>
									<span style="font-weight: bold; margin-right: 1em;">Encoding:</span>
									<span v-for="(item, index) in encodings" :key="index">
										<RadioButton v-model="log.encoding" :inputId="item" :value="item" />
										<label :for="item" class="ml-2">{{ item }}</label>
									</span>
								</span>
								<span style="margin-left: 4em">
									<Checkbox v-model="log.pinned" :binary="true" inputId="pinned" />
									<label for="pinned" class="ml-2" style="font-weight: bold; user-select: none;">{{ $t('global_log_pinned') }}</label>
								</span>
							</div>
						</td>
                    </tr>
                </table>
				<Panel v-if="currentLog && currentLog.attachments && currentLog.attachments.length" :header="$t('logedit_existing_attachments')" :toggleable="true">
					<div class="grid" style="margin-top: 2em">
						<div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="(attachment, index) in currentLog.attachments" :key="index" style="padding: 1em;">
							<div v-if="imageMimeTypes.includes(attachment.contentType)">
								<Image :src="attachmentUrl(log._id, attachment.name)" alt="Attachment Image" width="100" preview />
							</div>
							<div v-else>
								<img alt="Attachment File" :src="attachmentIcon(attachment.name)" width="60" style="cursor: pointer;" @click="downloadAttachment(log._id, attachment.name)" />
							</div>
							<div>
								<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
								<span style="margin-right: 1em;">{{ Math.round(attachment.size/1000) }} KB</span>
								<i v-if="attachment.deleting" class="fa fa-ban fa-lg" v-tooltip.top="$t('global_cancel')" style="cursor: pointer; color: orange; margin-right: .75em" @click="attachment.deleting=false"></i>
								<i v-else class="fa fa-close fa-lg" v-tooltip.top="$t('global_delete')" style="cursor: pointer; color: red; margin-right: .75em" @click="attachment.deleting=true"></i>
							</div>
						</div>
					</div>
				</Panel>
				<Panel :header="$t('logedit_new_attachments')" :toggleable="true">
					<div>
						<input type="file" id="file" ref="increasefile" multiple v-on:change="handleIncreaseFileUpload()"/>
					</div>
					<div style="margin-top: .8em;">
						<div v-for="(item, index) in increaseAttachments" :key="index" style="font-size: 1em; margin-top: .2em;">
							<i style="margin-right: .5em" class="fa fa-file-o"></i>
							<span style="margin-right: 2em">{{ item.name }}</span>
							<span style="margin-right: 4em">{{ Math.round(item.size/1000) }}KB</span>
							<i style="color: red; cursor: pointer;" class="fa fa-times" v-tooltip.top="'删除'" @click="deleteAttachment(index)"></i>
						</div>
					</div>
				</Panel>
            </template>
            <template #footer>
				<Button icon="pi pi-check" :label="$t('global_submit')" @click="editLog" />
				<Button icon="pi pi-times" :label="$t('global_cancel')" class="p-button-text" style="margin-left: 1em" @click="onCancelClick" />
				<Button style="float: right; background-color: Peru; border-color: Peru;" :label="$t('global_save')" icon="fa fa-save" size="small" severity="info" @click="saveLog" />
			</template>
        </Card>

		<Dialog v-model:visible="discardLogDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
				<span style="color: orange; font-size: 1.2em;">{{ $t('global_log_discard_edit_prompt') }}</span>
			</div>
			<template #footer>
				<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="discardLogDialog = false"/>
				<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="discardLog" />
			</template>
		</Dialog>
	</div>
	
</template>
<script>
import dateFormat from "dateformat";
import { ClassicEditor } from 'ckeditor5';
import fileDownload from 'js-file-download';
import LogService from '../service/LogService';
import TagService from '../service/TagService';
import config from '@/config/configuration.js';

export default {
	data() {
		return {
			tags: [],
			categories: [],

			currentLog: {},
			log: {},
			discardLogDialog: false,

			editor: ClassicEditor,
			editorConfig: {},

			increaseAttachments: [],

			imageMimeTypes: ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'],

			intervalId: null,

			submitted: false,
			editTimestamp: null,
		}
	},

	logService: null,
	tagService: null,

	created() {
		this.logService = new LogService();
		this.tagService = new TagService();

		// Load configuration for the rich text editor
		this.editorConfig = this.logService.generateRichTextConfig(true);

		if(config.logAutoSave === true) {
			this.intervalId = setInterval(this.logAutoSave, 10 * 60 * 1000); // 10 minutes
		}

		window.addEventListener('beforeunload', this.beforeUnloadHandler);
	},

	mounted() {
		this.fetchLog();
		// this.fetchTags();
		this.fetchCategories();
		this.fetchEncodings();
	},

	beforeUnmount(){
		if(this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		window.removeEventListener('beforeunload', this.beforeUnloadHandler);
	},

	beforeRouteLeave (to, from , next) {
		if(this.submitted === true) {
			return next();
		}

		const answer = window.confirm('Do you really want to leave? You may have unsaved changes!')
		if(answer) {
			next();
		} else {
			next(false);
		}
	},

	methods: {
		beforeUnloadHandler(event) {
			// Recommended
			event.preventDefault();
			// Included for legacy support, e.g. Chrome/Edge < 119
			event.returnValue = true;
		},
		fetchLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

            this.logService.findLog(this.$route.params.id)
            .then(log => {
                this.currentLog = log;

				this.log._id = log._id;
				this.log.logbook = log.logbook._id;
				if(log.tags && log.tags.length) {
					this.log.tags = log.tags.map(function(a) {return a._id;});
				}
				this.log.category = log.category;
				this.log.title = log.title;
				this.log.description = log.description;
				this.log.encoding = log.encoding;
				this.log.pinned = log.pinned;
				// console.log(this.log);

				// Fetch tags for the logbook
				this.fetchTags(log.logbook._id);

				// The edit timestamp
				this.editTimestamp = log.updatedAt;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_log_load_error'), detail: error.message });
				}
            })
        },
		fetchTags(logbook) {
            this.tagService.findTags(logbook)
            .then(tags => {
                this.tags = tags;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_tag_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_tag_load_error'), detail: error.message });
				}
            });
        },
		fetchCategories() {
            this.categories = JSON.parse(this.$t('logedit_catetory_options'));
        },
		fetchEncodings() {
            this.encodings = LogService.encodings;
        },
		fetchSavedLog(id) {
            this.logService.findLog(id)
            .then(log => {
				this.log._id = log._id;
				this.log.logbook = log.logbook._id;
				if(log.tags && log.tags.length) {
					this.log.tags = log.tags.map(function(a) {return a._id;});
				}
				this.log.category = log.category;
				this.log.title = log.title;
				this.log.description = log.description;
				this.log.encoding = log.encoding;
				this.log.pinned = log.pinned;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_saved_log_readback_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_saved_log_readback_error'), detail: error.message });
				}
            })
        },
		editLog() {
			let validity = this.logService.validate(this.log);
			if(!validity.valid) {
				this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: validity.message });
				return;
			}
			
			let loader = this.$loading.show();

			// Append the log timestamp when creating
			this.log.editTimestamp = this.editTimestamp;

			let formData = new FormData();
            formData.append('log', JSON.stringify(this.log));

			// for (const value of formData.values()) {
			// 	console.log(value);
			// }
			
			let reduceAttachments = [];
			if(this.currentLog && this.currentLog.attachments && this.currentLog.attachments.length) {
				for(let item of this.currentLog.attachments) {
					if(item.deleting) {
						reduceAttachments.push(item.name);
					}
				}
			}
            formData.append('reduceAttachments', JSON.stringify(reduceAttachments));
            // console.log(reduceAttachments);

            for(let i=0; i<this.increaseAttachments.length; i++) {
                formData.append('attachments', this.increaseAttachments[i]);
            }

            this.logService.editLogFormData(this.log._id, formData).then(() => {
				this.submitted = true;
                this.$router.push({name: 'logbook', params: { id: this.currentLog.logbook._id }});
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		saveLog() {
			let validity = this.logService.validate(this.log);
			if(!validity.valid) {
				this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: validity.message });
				return;
			}

			let loader = this.$loading.show();

            this.logService.saveLog(this.log)
			.then((log) => {
				this.fetchSavedLog(log._id);
				this.$toast.add({severity: 'info', summary: this.$t('global_save_success'), detail: `${this.showDateTimeWithSecond(log.savedAt)}`, life: 5000});
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		discardLog() {
			this.$router.push({name: 'logbook', params: { id: this.currentLog.logbook._id }});
		},
		onCancelClick() {
			// this.discardLogDialog = true;
			this.discardLog();
		},
		handleIncreaseFileUpload() {
            this.increaseAttachments.push(...Array.from(this.$refs.increasefile.files));
            // console.log(this.increaseAttachments);
        },
		deleteAttachment(index) {
			if(!this.increaseAttachments || !this.increaseAttachments.length) return;
			this.increaseAttachments.splice(index, 1);
		},
		attachmentUrl(logId, fileName) {
            // console.log(this.logService.attachmentUrl(logId, fileName));
            return this.logService.attachmentUrl(logId, fileName);
        },
		attachmentIcon(fileName) {
            return this.logService.attachmentIcon(fileName);
        },
        openAttachment(logId, fileName) {
            window.open(this.attachmentUrl(logId, fileName));
        },
        downloadAttachment(logId, fileName) {
            this.logService.findAttachment(logId, fileName)
            .then((attachment) => {
                fileDownload(attachment, fileName);
            }).catch(error => {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
            });
        },
		logAutoSave() {
			if(this.log.title && this.log.description) {
				this.saveLog();
			}
		},
		showDateTimeWithSecond(value) {
            return dateFormat(value, "yyyy-mm-dd HH:MM:ss");
        },
	},

	computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        }
    },

	watch: {
		userInfo() {
			if(!this.userInfo) {
				this.$router.push({path: '/access'});
			}
		},
		'$i18n.locale'() {
            this.fetchCategories();
        },
	},
}
</script>

<style scoped>
table, th, td {
  border-collapse: collapse;
  border: 1px solid lightgray;
}
</style>
