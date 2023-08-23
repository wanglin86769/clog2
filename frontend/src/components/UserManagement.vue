<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					{{ $t('usermanagement_title') }}
				</div>

				<Toolbar class="mb-0">
					<template v-slot:start>
						<Button v-if="isAdmin" :label="$t('global_add')" icon="pi pi-plus" class="p-button-success p-button-sm mr-2" @click="onAddClick" />
					</template>

					<template v-slot:end>
						<span class="p-input-icon-left">
							<i class="pi pi-search" style="color: RGB(29,149,243)" />
							<InputText class="p-inputtext-sm" @input="onSearchInput" v-model="filters.search" :placeholder="$t('usermanagement_search')" />
							<!-- <Button icon="pi pi-search" class="p-button-primary p-button-sm" @click="search"/> -->
						</span>
					</template>
				</Toolbar>

				<DataTable :value="users" dataKey="_id" :paginator="true" :rows="25" :rowHover="true" showGridlines removableSort
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25,50]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users" 
							paginatorPosition="both" responsiveLayout="stack" v-model:first="currentPageFirstIndex">

					<Column field="name" :header="$t('global_index')">
						<template #body="slotProps">
							<!-- {{currentPageFirstIndex + slotProps.index + 1}} -->
							{{slotProps.index + 1}}
						</template>
					</Column>
					<Column field="name" :header="$t('global_name')">
						<template #body="slotProps">
							{{slotProps.data.name}}
						</template>
					</Column>
					<Column field="email" :header="$t('global_email')" :sortable="true">
						<template #body="slotProps">
							{{slotProps.data.email}}
						</template>
					</Column>
					<Column field="admin" :header="$t('global_admin')" :sortable="true">
						<template #body="slotProps">
							<span v-if="slotProps.data.admin===true">{{ $t('global_yes') }}</span>
						</template>
					</Column>
					<Column headerStyle="width: 8em">
						<template #header>
							<i class="pi pi-cog" style="fontSize: 1.2rem" v-tooltip.top="$t('global_operate')"></i>
						</template>
						<template #body="slotProps">
							<i v-if="isAdmin" class="fa fa-pencil" v-tooltip.top="$t('global_edit')" style="cursor: pointer; color: orange; margin-right: .75em" @click="onEditClick(slotProps.data)"></i>
							<i v-if="isAdmin" class="fa fa-close" v-tooltip.top="$t('global_delete')" style="cursor: pointer; color: red; margin-right: .75em" @click="onDeleteClick(slotProps.data)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: darkorange">
							{{ $t('global_no_data') }}
						</div>
					</template>
				</DataTable>
			</div>

			<Dialog v-model:visible="userDialog" :header="crudOperation==='create'?$t('usermanagement_create_user'):crudOperation==='update'?$t('usermanagement_edit_user'):''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_name') }}</label>
					<InputText v-model.trim="user.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_email') }}</label>
					<InputText v-model.trim="user.email" class="p-inputtext-sm" />
				</div>
				<div class="field-checkbox">
					<div>{{ $t('global_admin') }}</div>
					<InputSwitch v-model="user.admin" style="margin-left: 10px" />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_create')" icon="pi pi-check" class="p-button-primary" @click="createUser" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_modify')" icon="pi pi-check" class="p-button-primary" @click="editUser" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteUserDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">{{ $t('usermanagement_delete_user_prompt') }}</span>
					<div style="text-indent: 3em;">{{ $t('global_name') }}: {{ user.name }}</div>
					<div style="text-indent: 3em;">{{ $t('global_email') }}: {{ user.email }}</div>
					<div style="text-indent: 3em;">{{ $t('global_admin') }}: {{ user.admin ? $t('global_yes') : $t('global_no') }}</div>
				</div>
				<template #footer>
					<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteUserDialog = false"/>
					<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteUser" />
				</template>
			</Dialog>
		</div>
	</div>

</template>

<script>
import UserService from '@/service/UserService';

export default {
	data() {
		return {
			crudOperation: '',    // 'create', 'read', 'update' or 'delete'
			users: null,
			userDialog: false,
			deleteUserDialog: false,
			user: {},
			filters: {},
			currentPageFirstIndex: 0,
		}
	},
	userService: null,
	created() {
		this.userService = new UserService();
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.userService.findUsers()
			.then(users => this.users = users)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('usermanagement_user_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('usermanagement_user_load_error'), detail: error.message });
				}
			});
		},
		onAddClick() {
			this.crudOperation = "create";
			this.user = {};
			this.userDialog = true;
		},
		onEditClick(user) {
			this.crudOperation = "update";
			this.user = {};
			this.user._id = user._id;
			this.user.name = user.name;
			this.user.email = user.email;
			this.user.admin = user.admin;
			this.userDialog = true;
		},
		onDeleteClick(user) {
			this.user = user;
			this.deleteUserDialog = true;
		},
		hideDialog() {
			this.userDialog = false;
		},
		createUser() {
			let loader = this.$loading.show();

			this.userService.addUser(this.user).then(() => {
				this.userDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('usermanagement_user_create_success'), detail: '', life: 5000});
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
		editUser() {
			let loader = this.$loading.show();

			this.userService.updateUser(this.user._id, this.user).then(() => {
				this.userDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('usermanagement_user_modify_success'), detail: '', life: 5000});
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
		deleteUser() {
			let loader = this.$loading.show();

			this.userService.deleteUser(this.user._id)
			.then(() => {
				this.deleteUserDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('usermanagement_user_delete_success'), detail: '', life: 5000});
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
		onSearchInput() {
			console.log('onSearchInput');
			this.debounce(() => this.search());
		},
		search() {
			this.userService.findUsers(this.filters)
			.then(users => { 
				this.users = users; 
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			});
		},
		debounce(func, timeout = 500){
			if(this.debounceTimer) {
				clearTimeout(this.debounceTimer);
				this.debounceTimer = setTimeout(() => { 
					func.apply();
					this.debounceTimer = null;
				}, timeout); //tolerance in ms
			} else {
				this.debounceTimer = setTimeout(() => { 
					func.apply();
					this.debounceTimer = null;
				}, timeout); //tolerance in ms
			}
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
