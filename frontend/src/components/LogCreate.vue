<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Card class="shadow-2" style="margin-bottom: 2em;">
            <template #title>
                {{ $t('logcreate_title') }}
				<Button style="margin-left: 1em" :label="$t('templatemanagement_import_template')" icon="fa fa-file-text-o" size="small" severity="success" @click="onImportLogTemplateClick" />
				<Button style="float: right; background-color: Peru; border-color: Peru;" :label="$t('global_save')" icon="fa fa-save" size="small" severity="info" @click="saveLog" />
			</template>
            <!-- <template #subtitle>
                Subtitle
            </template> -->
            <template #content>
				<table border="1" width="100%">
                    <tr height="40em">
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_logbook') }}</span><span style="color: red"> *</span></td>
                        <td width="80%" align="left"><span style="margin-left: 0.8em;">{{ logbook.name }}</span></td>
                    </tr>
                    <tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_author') }}</span><span style="color: red"> *</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.name }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_author_email') }}</span><span style="color: red"> *</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.email }}</span></td>
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
								<span style="margin-left: 4em">
									<Checkbox v-model="log.sharedEditing" :binary="true" inputId="sharedEditing" />
									<label for="sharedEditing" class="ml-2" style="font-weight: bold; user-select: none;">{{ $t('global_log_shared_editing') }}</label>
								</span>
							</div>
						</td>
                    </tr>
                </table>
				<Panel :header="$t('global_log_attachment')" :toggleable="true">
					<div>
						<input type="file" id="file" ref="file" multiple v-on:change="handleFileUpload()"/>
					</div>
					<div style="margin-top: .8em;">
						<div v-for="(item, index) in submittingAttachments" :key="index" style="font-size: 1em; margin-top: .2em;">
							<i style="margin-right: .5em" class="fa fa-file-o"></i>
							<span style="margin-right: 2em">{{ item.name }}</span>
							<span style="margin-right: 4em">{{ Math.round(item.size/1000) }}KB</span>
							<i style="color: red; cursor: pointer;" class="fa fa-times" v-tooltip.top="'删除'" @click="deleteAttachment(index)"></i>
						</div>
					</div>
				</Panel>
            </template>
            <template #footer>
				<Button icon="pi pi-check" :label="$t('global_submit')" @click="createLog" />
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

		<Dialog v-model:visible="importLogTemplateDialog" :header="$t('templatemanagement_template_selection')" :modal="true" style="min-width: 60%">
			<DataTable :value="templates" dataKey="_id" :rowHover="true" showGridlines responsiveLayout="stack">
				<Column field="name" :header="$t('global_index')">
					<template #body="slotProps">
						{{slotProps.index + 1}}
					</template>
				</Column>
				<Column field="name" :header="$t('global_naming')">
					<template #body="slotProps">
						{{slotProps.data.name}}
					</template>
				</Column>
				<Column field="category" :header="$t('global_log_category')">
					<template #body="slotProps">
						{{slotProps.data.category}}
					</template>
				</Column>
				<Column headerStyle="width: 8em">
					<template #header>
						<i class="pi pi-cog" style="fontSize: 1.2rem" v-tooltip.top="$t('global_operate')"></i>
					</template>
					<template #body="slotProps">
						<i class="fa fa-check-circle-o fa-lg" v-tooltip.top="$t('templatemanagement_select')" style="cursor: pointer; color: RGB(29,149,243); margin-right: .75em" @click="onSelectTemplateClick(slotProps.data)"></i>
					</template>
				</Column>
				<template #empty>
					<div style="color: darkorange">
						{{ $t('global_no_data') }}
					</div>
				</template>
			</DataTable>
			<template #footer>
				<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="importLogTemplateDialog = false"/>
			</template>
		</Dialog>
	</div>
	
</template>
<script>
import dateFormat from "dateformat";
import { ClassicEditor } from 'ckeditor5';
import LogService from '../service/LogService';
import LogbookService from '../service/LogbookService';
import TagService from '../service/TagService';
import TemplateService from '../service/TemplateService';
import config from '@/config/configuration.js';

export default {
	data() {
		return {
			tags: [],
			categories: [],
			encodings: [],
			log: {},
			logbook: {},
			submittingAttachments: [],
			discardLogDialog: false,

			templates: [],
			importLogTemplateDialog: false,

			editor: ClassicEditor,
			editorConfig: {},

			intervalId: null,

			submitted: false,
			editTimestamp: null,
		}
	},

	logService: null,
	logbookService: null,
	tagService: null,
	templateService: null,

	created() {
		this.logService = new LogService();
		this.logbookService = new LogbookService();
		this.tagService = new TagService();
		this.templateService = new TemplateService();

		this.log.logbook = this.$route.params.logbookid;

		// Load configuration for the rich text editor
		this.editorConfig = this.logService.generateRichTextConfig(true);

		if(config.logAutoSave === true) {
			this.intervalId = setInterval(this.logAutoSave, 10 * 60 * 1000); // 10 minutes
		}

		window.addEventListener('beforeunload', this.beforeUnloadHandler);
	},

	mounted() {
		// Permission guard
		if(!this.userInfo) {
			this.$router.push({path: '/access'});
			return;
		}

		this.fetchLogbook();
		this.fetchTags();
		this.fetchCategories();
		this.fetchEncodings();
		this.fetchTemplates();
		this.fetchPrototype();

		// console.log(this.log);
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
		fetchLogbook() {
			if(!this.$route.params.logbookid) {
				console.log('Logbook id not found.');
				return;
			}

            this.logbookService.findLogbook(this.$route.params.logbookid)
            .then(logbook => {
                this.logbook = logbook;
            });
        },
		fetchTags() {
            this.tagService.findTags(this.$route.params.logbookid)
            .then(tags => {
                this.tags = tags;
            });
        },
		fetchTemplates() {
			this.templateService.findTemplates()
			.then(templates => this.templates = templates)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('templatemanagement_template_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('templatemanagement_template_load_error'), detail: error.message });
				}
			});
		},
		fetchCategories() {
            this.categories = JSON.parse(this.$t('logedit_catetory_options'));
			if(this.categories && this.categories.length) {
				this.log.category = this.categories[0];
			}
        },
		fetchEncodings() {
            this.encodings = LogService.encodings;
			if(this.encodings && this.encodings.length) {
				this.log.encoding = this.encodings[0];
			}
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

				// The first save
				if(!this.editTimestamp && log.updatedAt) {
					this.editTimestamp = log.updatedAt;
				}
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_saved_log_readback_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logedit_saved_log_readback_error'), detail: error.message });
				}
            })
        },
		fetchPrototype() {
			if(!this.$route.query.prototype) return;
			
            this.logService.findLog(this.$route.query.prototype)
            .then(log => {
                this.log.title = log.title;
				this.log.description = log.description;
				this.log.category = log.category;
				this.log.tags = log.tags.map(function(a) {return a._id;});
				this.log.encoding = log.encoding;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logcreate_log_prototype_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logcreate_log_prototype_load_error'), detail: error.message });
				}
            });
		},
		onCancelClick() {
			// this.discardLogDialog = true;
			this.discardLog();
		},
		onImportLogTemplateClick() {
			this.importLogTemplateDialog = true;
		},
		onSelectTemplateClick(template) {
			this.log.description = template.content;
			this.log.category = template.category;
			this.importLogTemplateDialog = false;
		},
		createLog() {
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
			for(let i=0; i<this.submittingAttachments.length; i++) {
                formData.append('attachments', this.submittingAttachments[i]);
            }

            this.logService.addLogFormData(formData)
			.then(() => {
				this.submitted = true;
                this.$router.push({name: 'logbook', params: { id: this.$route.params.logbookid }});
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
			this.$router.push({name: 'logbook', params: { id: this.$route.params.logbookid }});
		},
		handleFileUpload(){
            this.submittingAttachments.push(...Array.from(this.$refs.file.files));
            // console.log(this.submittingAttachments);
        },
		deleteAttachment(index) {
			if(!this.submittingAttachments || !this.submittingAttachments.length) return;
			this.submittingAttachments.splice(index, 1);
		},
		saveLogToCache() { // This method is not used anymore
			if(!this.userInfo || !this.userInfo.email) {
				return;
			}
			if(this.log.title || this.log.description) {
				let log = { title: this.log.title, description: this.log.description, encoding: this.log.encoding };
				localStorage.setItem(`${config.localStorageLogCachePrefix}:${this.userInfo.email}`, JSON.stringify(log));
			}
        },
		restoreCacheToLog() { // This method is not used anymore
			if(!this.userInfo || !this.userInfo.email) {
				return;
			}
			let log = JSON.parse(localStorage.getItem(`${config.localStorageLogCachePrefix}:${this.userInfo.email}`));
            if(!log) return;
			if(log.title || log.description) {
				this.log.title = log.title;
				this.log.description = log.description;
				this.log.encoding = log.encoding;
			}
			this.clearLogCache();
		},
		clearLogCache() { // This method is not used anymore
			if(!this.userInfo || !this.userInfo.email) {
				return;
			}
			localStorage.removeItem(`${config.localStorageLogCachePrefix}:${this.userInfo.email}`);
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
