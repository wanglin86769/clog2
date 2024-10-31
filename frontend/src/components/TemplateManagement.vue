<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					{{ $t('templatemanagement_title') }}
				</div>

				<Button v-if="userInfo" :label="$t('global_add')" icon="pi pi-plus" style="margin-bottom: 5px" class="p-button-success p-button-sm mr-2" @click="onAddClick" />
				
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
					<Column field="number" :header="$t('global_number')">
						<template #body="slotProps">
							{{slotProps.data.number}}
						</template>
					</Column>
					<Column headerStyle="width: 8em">
						<template #header>
							<i class="pi pi-cog" style="fontSize: 1.2rem" v-tooltip.top="$t('global_operate')"></i>
						</template>
						<template #body="slotProps">
							<i v-if="canEdit(slotProps.data)" class="fa fa-pencil" v-tooltip.top="$t('global_edit')" style="cursor: pointer; color: orange; margin-right: .75em" @click="onEditClick(slotProps.data)"></i>
							<i v-if="canEdit(slotProps.data)" class="fa fa-close" v-tooltip.top="$t('global_delete')" style="cursor: pointer; color: red; margin-right: .75em" @click="onDeleteClick(slotProps.data)"></i>
							<i class="fa fa-search-plus" v-tooltip.top="$t('global_detail')" style="cursor: pointer; color: RGB(29,149,243); margin-right: .75em" @click="onDetailClick(slotProps.data)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: darkorange">
							{{ $t('global_no_data') }}
						</div>
					</template>
				</DataTable>
			</div>

			<Dialog v-model:visible="templateDialog" :header="$t('templatemanagement_title')" :modal="true" class="p-fluid" style="min-width: 80%">
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_naming') }}</label>
					<InputText v-model.trim="template.name" class="p-inputtext-sm" :disabled="true" />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_log_category') }}</label>
					<InputText v-model.trim="template.category" class="p-inputtext-sm" :disabled="true" />
				</div>
				<div class="field">
					<label>{{ $t('global_number') }}</label>
					<InputText v-model.trim="template.number" class="p-inputtext-sm" :disabled="true" />
				</div>
				<div class="field">
					<label>{{ $t('templatemanagement_content') }}</label>
					<table border="1" width="100%" bordercolor="#e9ecef" style="border-collapse: collapse">
						<tr>
							<td align="left">
								<div v-html="template.content" class="ck-content" style="padding: 10px" ></div>
							</td>
						</tr>
					</table>
				</div>

				<template #footer>
					<div style="float: left">
						<span v-if="template.updatedAt" style="color: RGB(104,159,56);" >{{ $t('global_log_last_update') }}: {{ showDateTime(template.updatedAt) }}&nbsp;&nbsp;{{ template.updatedBy.name }}</span>
					</div>
					<Button :label="$t('global_close')" icon="pi pi-times" class="p-button-text" @click="templateDialog=false"/>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteTemplateDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">{{ $t('templatemanagement_delete_template_prompt') }}</span>
					<div style="text-indent: 3em;">{{ $t('global_naming') }}: {{ template.name }}</div>
					<div style="text-indent: 3em;">{{ $t('global_number') }}: {{ template.number }}</div>
				</div>
				<template #footer>
					<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteTemplateDialog = false"/>
					<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteTemplate" />
				</template>
			</Dialog>
		</div>
	</div>

</template>

<script>
import dateFormat from "dateformat";
import TemplateService from '../service/TemplateService';

export default {
	data() {
		return {
			templates: [],
			template: {},
			templateDialog: false,
			deleteTemplateDialog: false,
		}
	},
	templateService: null,
	created() {
		this.templateService = new TemplateService();
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
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
		onAddClick() {
			this.$router.push({name: 'templateedit', params: { id: 'new' }});
		},
		onEditClick(template) {
			this.$router.push({name: 'templateedit', params: { id: template._id }});
		},
		onDeleteClick(template) {
			this.template = template;
			this.deleteTemplateDialog = true;
		},
		onDetailClick(template) {
			this.template = template;
			this.templateDialog = true;
		},
		deleteTemplate() {
			let loader = this.$loading.show();

			this.templateService.deleteTemplate(this.template._id)
			.then(() => {
				this.deleteTemplateDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('templatemanagement_template_delete_success'), detail: '', life: 5000});
				this.loadData();
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
		showDate(value) {
            return dateFormat(value, "yyyy-mm-dd");
        },
        showTime(value) {
            return dateFormat(value, "HH:MM");
        },
        showDateTime(value) {
            return dateFormat(value, "yyyy-mm-dd HH:MM");
        },
		canEdit(template) {
			// Clog admin can edit the template
			if(this.isAdmin) {
				return true;
			}
			// Template author can edit the template
			if(template.createdBy && this.userInfo && template.createdBy.email === this.userInfo.email) {
				return true;
			}
			return false;
		},
	},
	computed: {
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
:deep(.p-datatable) thead th {
	background-color: RGB(245,245,245);
	color: RGB(29,149,243);
}

/* Remove border of ckeditor */
:deep(.ck) {
    border:0px !important;
}
	
</style>