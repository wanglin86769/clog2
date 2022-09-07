<template>
	<div class="p-grid">
		<div class="p-col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					{{ $t('groupmanagement_title') }}
				</div>

				<Button v-if="userInfo && isAdmin" :label="$t('global_add')" icon="pi pi-plus" style="margin-bottom: 5px" class="p-button-success p-button-sm p-mr-2" @click="onAddClick" />
				
				<DataTable :value="groups" dataKey="_id" :rowHover="true" showGridlines responsiveLayout="stack">
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

			<Dialog v-model:visible="groupDialog" :header="crudOperation==='create'?$t('groupmanagement_create_group'):crudOperation==='update'?$t('groupmanagement_edit_group'):''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="p-field">
					<span style="color: red">*</span><label> {{ $t('global_naming') }}</label>
					<InputText v-model.trim="group.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="p-field">
					<span style="color: red">*</span><label> {{ $t('global_number') }}</label>
					<InputText v-model.trim="group.email" class="p-inputtext-sm" />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_create')" icon="pi pi-check" class="p-button-primary" @click="createGroup" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_modify')" icon="pi pi-check" class="p-button-primary" @click="editGroup" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteGroupDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">{{ $t('groupmanagement_delete_group_prompt') }}</span>
					<div style="text-indent: 3em;">{{ $t('global_naming') }}: {{ group.name }}</div>
					<div style="text-indent: 3em;">{{ $t('global_number') }}: {{ group.number }}</div>
				</div>
				<template #footer>
					<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteGroupDialog = false"/>
					<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteGroup" />
				</template>
			</Dialog>
		</div>
	</div>

</template>

<script>
import GroupService from '@/service/GroupService';

export default {
	data() {
		return {
			crudOperation: '',    // 'create', 'read', 'update' or 'delete'
			groups: null,
			groupDialog: false,
			deleteGroupDialog: false,
			group: {},
		}
	},
	groupService: null,
	created() {
		this.groupService = new GroupService();
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.groupService.findGroups()
			.then(groups => this.groups = groups)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('groupmanagement_group_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('groupmanagement_group_load_error'), detail: error.message });
				}
			});
		},
		onAddClick() {
			this.crudOperation = "create";
			this.group = {};
			this.groupDialog = true;
		},
		onEditClick(group) {
			this.crudOperation = "update";
			this.group = {};
			this.group._id = group._id;
			this.group.name = group.name;
			this.group.number = group.number;
			this.groupDialog = true;
		},
		onDeleteClick(group) {
			this.group = group;
			this.deleteGroupDialog = true;
		},
		hideDialog() {
			this.groupDialog = false;
		},
		createGroup() {
			this.groupService.addGroup(this.group).then(() => {
				this.groupDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('groupmanagement_group_create_success'), detail: '', life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			})
		},
		editGroup() {
			this.groupService.updateGroup(this.group._id, this.group)
			.then(() => {
				this.groupDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('groupmanagement_group_modify_success'), detail: '', life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			})
		},
		deleteGroup() {
			this.groupService.deleteGroup(this.group._id)
			.then(() => {
				this.deleteGroupDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('groupmanagement_group_delete_success'), detail: '', life: 5000});
				this.loadData();
			}).catch(error => {
				// loader.hide();
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
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
