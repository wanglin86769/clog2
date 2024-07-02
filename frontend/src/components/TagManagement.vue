<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					{{ $t('tagmanagement_title') }}
				</div>

				<Button v-if="userInfo && isAdmin" :label="$t('global_add')" icon="pi pi-plus" style="margin-bottom: 5px" class="p-button-success p-button-sm mr-2" @click="onAddClick" />
				
				<DataTable :value="tags" dataKey="_id" :rowHover="true" showGridlines responsiveLayout="stack">
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
							<i v-if="userInfo && isAdmin" class="fa fa-pencil" v-tooltip.top="$t('global_edit')" style="cursor: pointer; color: orange; margin-right: .75em" @click="onEditClick(slotProps.data)"></i>
							<i v-if="userInfo && isAdmin" class="fa fa-close" v-tooltip.top="$t('global_delete')" style="cursor: pointer; color: red; margin-right: .75em" @click="onDeleteClick(slotProps.data)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: darkorange">
							{{ $t('global_no_data') }}
						</div>
					</template>
				</DataTable>
			</div>

			<Dialog v-model:visible="tagDialog" :header="crudOperation==='create'?$t('tagmanagement_create_tag'):crudOperation==='update'?$t('tagmanagement_edit_tag'):''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_naming') }}</label>
					<InputText v-model.trim="tag.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="field">
					<label>{{ $t('global_number') }}</label>
					<InputText v-model.trim="tag.number" class="p-inputtext-sm" />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_create')" icon="pi pi-check" class="p-button-primary" @click="createTag" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_modify')" icon="pi pi-check" class="p-button-primary" @click="editTag" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteTagDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">{{ $t('tagmanagement_delete_tag_prompt') }}</span>
					<div style="text-indent: 3em;">{{ $t('global_naming') }}: {{ tag.name }}</div>
					<div style="text-indent: 3em;">{{ $t('global_number') }}: {{ tag.number }}</div>
				</div>
				<template #footer>
					<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteTagDialog = false"/>
					<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteTag" />
				</template>
			</Dialog>
		</div>
	</div>

</template>

<script>
import TagService from '@/service/TagService';

export default {
	data() {
		return {
			crudOperation: '',    // 'create', 'read', 'update' or 'delete'
			tags: null,
			tagDialog: false,
			deleteTagDialog: false,
			tag: {},
		}
	},
	tagService: null,
	created() {
		this.tagService = new TagService();
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.tagService.findTags()
			.then(tags => this.tags = tags)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('tagmanagement_tag_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('tagmanagement_tag_load_error'), detail: error.message });
				}
			});
		},
		onAddClick() {
			this.crudOperation = "create";
			this.tag = {};
			this.tagDialog = true;
		},
		onEditClick(tag) {
			this.crudOperation = "update";
			this.tag = {};
			this.tag._id = tag._id;
			this.tag.name = tag.name;
			this.tag.number = tag.number;
			this.tagDialog = true;
		},
		onDeleteClick(tag) {
			this.tag = tag;
			this.deleteTagDialog = true;
		},
		hideDialog() {
			this.tagDialog = false;
		},
		createTag() {
			let loader = this.$loading.show();

			this.tagService.addTag(this.tag).then(() => {
				this.tagDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('tagmanagement_tag_create_success'), detail: '', life: 5000});
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
		editTag() {
			let loader = this.$loading.show();

			this.tagService.updateTag(this.tag._id, this.tag).then(() => {
				this.tagDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('tagmanagement_tag_modify_success'), detail: '', life: 5000});
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
		deleteTag() {
			let loader = this.$loading.show();

			this.tagService.deleteTag(this.tag._id)
			.then(() => {
				this.deleteTagDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('tagmanagement_tag_delete_success'), detail: '', life: 5000});
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
	
</style>
