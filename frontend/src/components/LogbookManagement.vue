<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					{{ $t('logbookmanagement_title') }}
				</div>

				<Button v-if="userInfo && isAdmin" :label="$t('global_add')" icon="pi pi-plus" style="margin-bottom: 5px" class="p-button-success p-button-sm mr-2" @click="onAddClick" />
				
				<DataTable :value="logbooks" dataKey="_id" :rowHover="true" showGridlines responsiveLayout="stack">
					<Column field="name" :header="$t('global_index')">
						<template #body="slotProps">
							{{ slotProps.index + 1 }}
						</template>
					</Column>
					<Column field="name" :header="$t('global_naming')">
						<template #body="slotProps">
							{{ slotProps.data.name }}
						</template>
					</Column>
					<Column field="group" :header="$t('global_grouping')">
						<template #body="slotProps">
							<div v-if="slotProps.data.group">{{ slotProps.data.group.name }}</div>
						</template>
					</Column>
					<Column field="number" :header="$t('global_number')">
						<template #body="slotProps">
							{{ slotProps.data.number }}
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

			<Dialog v-model:visible="logbookDialog" :header="crudOperation==='create'?$t('logbookmanagement_create_logbook'):crudOperation==='update'?$t('logbookmanagement_edit_logbook'):''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_naming') }}</label>
					<InputText v-model.trim="logbook.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_grouping') }}</label>
					<Dropdown v-model="logbook.group" :options="groups" optionLabel="name" optionValue="_id" :placeholder="$t('global_select')" :showClear="true" />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_number') }}</label>
					<InputText v-model.trim="logbook.number" class="p-inputtext-sm" />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_create')" icon="pi pi-check" class="p-button-primary" @click="createLogbook" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_modify')" icon="pi pi-check" class="p-button-primary" @click="editLogbook" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteLogbookDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">{{ $t('logbookmanagement_delete_logbook_prompt') }}</span>
					<div style="text-indent: 3em;">{{ $t('global_naming') }}: {{ logbook.name }}</div>
					<div style="text-indent: 3em;">{{ $t('global_grouping') }}: {{ logbook.group ? logbook.group.name : '' }}</div>
					<div style="text-indent: 3em;">{{ $t('global_number') }}: {{ logbook.number }}</div>
				</div>
				<template #footer>
					<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteLogbookDialog = false"/>
					<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteLogbook" />
				</template>
			</Dialog>
		</div>
	</div>

</template>

<script>
import LogbookService from '@/service/LogbookService';
import GroupService from '@/service/GroupService';

export default {
	data() {
		return {
			crudOperation: '',    // 'create', 'read', 'update' or 'delete'
			logbooks: null,
			logbookDialog: false,
			deleteLogbookDialog: false,
			logbook: {},
			groups: [],
		}
	},
	logbookService: null,
	groupService: null,
	created() {
		this.logbookService = new LogbookService();
		this.groupService = new GroupService();
	},
	mounted() {
		this.loadData();
		this.getGroups();
	},
	methods: {
		loadData() {
			this.logbookService.findLogbooks()
			.then(logbooks => this.logbooks = logbooks)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logbookmanagement_logbook_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('logbookmanagement_logbook_load_error'), detail: error.message });
				}
			});
		},
		getGroups() {
			this.groupService.findGroups()
			.then(groups => this.groups = groups)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logbookmanagement_group_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('logbookmanagement_group_load_error'), detail: error.message });
				}
			});
		},
		onAddClick() {
			this.crudOperation = "create";
			this.logbook = {};
			this.logbookDialog = true;
		},
		onEditClick(logbook) {
			this.crudOperation = "update";
			this.logbook = {};
			this.logbook._id = logbook._id;
			this.logbook.name = logbook.name;
			if(logbook.group) this.logbook.group = logbook.group._id;
			this.logbook.number = logbook.number;
			this.logbookDialog = true;
		},
		onDeleteClick(logbook) {
			this.logbook = logbook;
			this.deleteLogbookDialog = true;
		},
		hideDialog() {
			this.logbookDialog = false;
		},
		createLogbook() {
			let loader = this.$loading.show();
			this.logbookService.addLogbook(this.logbook)
			.then(() => {
				this.logbookDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('logbookmanagement_logbook_create_success'), detail: '', life: 5000});
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
		editLogbook() {
			let loader = this.$loading.show();
			this.logbookService.updateLogbook(this.logbook._id, this.logbook)
			.then(() => {
				this.logbookDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('logbookmanagement_logbook_modify_success'), detail: '', life: 5000});
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
		deleteLogbook() {
			let loader = this.$loading.show();
			this.logbookService.deleteLogbook(this.logbook._id)
			.then(() => {
				this.deleteLogbookDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('logbookmanagement_logbook_delete_success'), detail: '', life: 5000});
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
::v-deep .p-datatable thead th {
	background-color: RGB(245,245,245);
	color: RGB(29,149,243);
}
	
</style>
