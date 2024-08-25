<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Card class="shadow-2" style="margin-bottom: 2em;">
            <template #title></template>
            <template #content>
				<div class="grid">
					<div class="col-12">
						<div class="p-fluid">
							<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
								<span v-if="isNewTemplate">{{ $t('templatemanagement_create_template') }}</span>
								<span v-else>{{ $t('templatemanagement_edit_template') }}</span>
							</div>
							<div class="field">
								<span style="color: red">* </span><label>{{ $t('global_naming') }}</label>
								<InputText v-model.trim="template.name" class="p-inputtext-sm" autofocus />
							</div>
							<div class="field">
								<label>{{ $t('global_number') }}</label>
								<InputText v-model.trim="template.number" class="p-inputtext-sm" />
							</div>
							<div class="field" spellcheck="false">
								<span style="color: red">* </span><label>{{ $t('templatemanagement_content') }}</label>
								<ckeditor :editor="editor" v-model="template.content" :config="editorConfig"></ckeditor>
							</div>
						</div>
					</div>
				</div>
            </template>
            <template #footer>
				<Button v-if="isNewTemplate" icon="pi pi-check" :label="$t('global_create')" @click="createTemplate" />
				<Button v-else icon="pi pi-check" :label="$t('global_modify')" @click="editTemplate" severity="warning" />
				<Button icon="pi pi-times" :label="$t('global_cancel')" class="p-button-text" style="margin-left: 1em" @click="onCancelClick" />
			</template>
        </Card>

		<Dialog v-model:visible="discardTemplateDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
				<span style="color: orange; font-size: 1.2em;">{{ $t('templatemanagement_discard_template_prompt') }}</span>
			</div>
			<template #footer>
				<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="discardTemplateDialog = false"/>
				<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="discardTemplate" />
			</template>
		</Dialog>
	</div>
</template>

<script>
import { ClassicEditor } from 'ckeditor5';
import TemplateService from '../service/TemplateService';
import LogService from '../service/LogService';

export default {
	data() {
		return {
			template: {},
			discardTemplateDialog: false,

			editor: ClassicEditor,
			editorConfig: {},
		}
	},
	templateService: null,
	logService: null,
	created() {
		this.templateService = new TemplateService();
		this.logService = new LogService();

		// Load configuration for the rich text editor
		this.editorConfig = this.logService.generateRichTextConfig(true);
	},
	mounted() {
		this.fetchTemplate();
	},
	methods: {
		fetchTemplate() {
			if(this.isNewTemplate) return;

			this.templateService.findTemplate(this.$route.params.id)
			.then(template => {
				this.template._id = template._id;
				this.template.name = template.name;
				this.template.number = template.number;
				this.template.content = template.content;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('templatemanagement_template_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('templatemanagement_template_load_error'), detail: error.message });
				}
			});
		},
		createTemplate() {
			let loader = this.$loading.show();

			this.templateService.addTemplate(this.template).then(() => {
				this.$router.push({name: 'templatemanagement'});
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		editTemplate() {
			let loader = this.$loading.show();

			this.templateService.updateTemplate(this.template._id, this.template).then(() => {
				this.$router.push({name: 'templatemanagement'});
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		onCancelClick() {
			this.discardTemplateDialog = true;
		},
		discardTemplate() {
			this.$router.push({name: 'templatemanagement'});
		},
	},
	computed: {
		isNewTemplate() {
			return this.$route.params.id === 'new';
		},
		userInfo() {
            return this.$store.state.authentication.user;
        },
		isAdmin() {
			return this.$store.state.authentication.user && this.$store.state.authentication.user.admin === true;
        },
    }
}
</script>

<style scoped>
	
</style>