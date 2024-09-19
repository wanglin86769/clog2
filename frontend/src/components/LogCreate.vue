<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Card class="shadow-2" style="margin-bottom: 2em;">
            <template #title>
                {{ $t('logcreate_title') }}
				<Button style="margin-left: 1em" :label="$t('templatemanagement_import_template')" icon="fa fa-file-text-o" size="small" severity="success" @click="onImportLogTemplateClick" />
            </template>
            <!-- <template #subtitle>
                Subtitle
            </template> -->
            <template #content>
				<table border="1" width="100%">
                    <tr height="40em">
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_logbook') }}</span></td>
                        <td width="80%" align="left"><span style="margin-left: 0.8em;">{{ logbook.name }}</span></td>
                    </tr>
                    <tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_author') }}</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.name }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_author_email') }}</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.email }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_tag') }}</span></td>
                        <td align="left">
							<MultiSelect style="min-width: 200px; margin-left: 0.4em;" v-model="log.tags" :options="tags" optionLabel="name" optionValue="_id" :placeholder="$t('global_select')" display="chip"/>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_category') }}</span></td>
                        <td align="left">
							<Dropdown style="min-width: 200px; margin-left: 0.4em;" v-model="log.category" :options="categories" :placeholder="$t('global_select')" />
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_title') }}</span></td>
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
								<span style="font-weight: bold; margin-right: 1em;">Encoding:</span>
								<span v-for="(item, index) in encodings" :key="index">
									<RadioButton v-model="log.encoding" :inputId="item" :value="item" />
									<label :for="item" class="ml-2">{{ item }}</label>
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
				<Button icon="pi pi-check" :label="$t('global_create')" @click="createLog" />
				<Button icon="pi pi-times" :label="$t('global_cancel')" class="p-button-text" style="margin-left: 1em" @click="onCancelClick" />
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

		this.intervalId = setInterval(this.saveLogToCache, 30000); // 30 seconds
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

		if(this.categories && this.categories.length) {
			this.log.category = this.categories[0];
		}
		if(this.encodings && this.encodings.length) {
			this.log.encoding = this.encodings[0];
		}
		// console.log(this.log);

		this.restoreCacheToLog();
	},

	beforeUnmount(){
		if(this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	},

	methods: {
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
            this.tagService.findTags()
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
            this.categories = LogService.categories;
        },
		fetchEncodings() {
            this.encodings = LogService.encodings;
        },
		onCancelClick() {
			this.discardLogDialog = true;
		},
		onImportLogTemplateClick() {
			this.importLogTemplateDialog = true;
		},
		onSelectTemplateClick(template) {
			this.log.description = template.content;
			this.importLogTemplateDialog = false;
		},
		createLog() {
			let validity = this.logService.validate(this.log);
			if(!validity.valid) {
				this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: validity.message });
				return;
			}

			let loader = this.$loading.show();

			let formData = new FormData();
            formData.append('log', JSON.stringify(this.log));
			for(let i=0; i<this.submittingAttachments.length; i++) {
                formData.append('attachments', this.submittingAttachments[i]);
            }

            this.logService.addLogFormData(formData)
			.then(() => {
				this.clearLogCache();
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
		discardLog() {
			this.clearLogCache();
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
		saveLogToCache() {
			if(!this.userInfo || !this.userInfo.email) {
				return;
			}
			if(this.log.title || this.log.description) {
				let log = { title: this.log.title, description: this.log.description, encoding: this.log.encoding };
				localStorage.setItem(`${config.localStorageLogCachePrefix}:${this.userInfo.email}`, JSON.stringify(log));
			}
        },
		restoreCacheToLog() {
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
		clearLogCache() {
			if(!this.userInfo || !this.userInfo.email) {
				return;
			}
			localStorage.removeItem(`${config.localStorageLogCachePrefix}:${this.userInfo.email}`);
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
		}
	},
}
</script>

<style scoped>
table, th, td {
  border-collapse: collapse;
  border: 1px solid lightgray;
}
</style>
