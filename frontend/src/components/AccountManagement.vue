<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					{{ $t('accountmanagement_title') }}
				</div>

				<Toolbar class="mb-0">
					<template v-slot:start>
						<Button v-if="isAdmin" :label="$t('global_add')" icon="pi pi-plus" class="p-button-success p-button-sm mr-2" @click="onAddClick" />
					</template>

					<template v-slot:end>
						<span class="p-input-icon-left">
							<i class="pi pi-search" style="color: RGB(29,149,243)" />
							<InputText class="p-inputtext-sm" @input="onSearchInput" v-model="filters.search" :placeholder="$t('accountmanagement_search')" />
							<!-- <Button icon="pi pi-search" class="p-button-primary p-button-sm" @click="search"/> -->
						</span>
					</template>
				</Toolbar>

				<DataTable :value="accounts" dataKey="_id" :paginator="true" :rows="25" :rowHover="true" showGridlines removableSort
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25,50]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} accounts" 
							paginatorPosition="both" responsiveLayout="stack" v-model:first="currentPageFirstIndex">
					<!-- <template #header>
						<div style="text-align: center; font-size: 1.2em; color: RGB(29,149,243);">账号信息</div>
					</template> -->

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
					<Column field="email" :header="$t('global_password')" >
						<template #body>
							**********
						</template>
					</Column>
					<Column :header="$t('accountmanagement_create_time')" :sortable="true">
						<template #body="slotProps">
							{{ showDateTime(slotProps.data.createdAt) }}
						</template>
					</Column>
					<Column :header="$t('accountmanagement_confirm_time')" :sortable="true">
						<template #body="slotProps">
							{{ showDateTime(slotProps.data.verifiedAt) }}
						</template>
					</Column>
					<Column :header="$t('accountmanagement_modify_time')" :sortable="true">
						<template #body="slotProps">
							{{ showDateTime(slotProps.data.updatedAt) }}
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

			<Dialog v-model:visible="accountDialog" :header="crudOperation==='create'?$t('accountmanagement_create_account'):crudOperation==='update'?$t('accountmanagement_edit_account'):''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_name') }}</label>
					<InputText v-model.trim="account.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_email') }}</label>
					<InputText v-model.trim="account.email" class="p-inputtext-sm" />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_password') }}</label>
					<Password v-model="account.password" class="p-inputtext-sm" :feedback="false" toggleMask />
				</div>
				<div class="field">
					<span style="color: red">* </span><label>{{ $t('global_confirm_password') }}</label>
					<Password v-model="password2" class="p-inputtext-sm" :feedback="false" toggleMask />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_create')" icon="pi pi-check" class="p-button-primary" @click="createAccount" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button :label="$t('global_modify')" icon="pi pi-check" class="p-button-primary" @click="editAccount" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteAccountDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange; font-size: 1.2em;">{{ $t('accountmanagement_delete_account_prompt') }}</span>
					<div style="text-indent: 3em;">{{ $t('global_name') }}: {{ account.name }}</div>
					<div style="text-indent: 3em;">{{ $t('global_email') }}: {{ account.email }}</div>
				</div>
				<template #footer>
					<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteAccountDialog = false"/>
					<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteAccount" />
				</template>
			</Dialog>
		</div>
	</div>

</template>

<script>
import dateFormat from "dateformat";
import AccountService from '@/service/AccountService';

export default {
	data() {
		return {
			crudOperation: '',    // 'create', 'read', 'update' or 'delete'
			accounts: null,
			accountDialog: false,
			deleteAccountDialog: false,
			account: {},
			filters: {},
			currentPageFirstIndex: 0,
			password2: '',
		}
	},
	accountService: null,
	created() {
		this.accountService = new AccountService();
	},
	mounted() {
		// Permission guard
		if(!this.isAdmin) {
			this.$router.push({path: '/access'});
			return;
		}

		this.loadData();
	},
	methods: {
		loadData() {
			this.accountService.findAccounts()
			.then(accounts => this.accounts = accounts)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('accountmanagement_account_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('accountmanagement_account_load_error'), detail: error.message });
				}
			});
		},
		onAddClick() {
			this.crudOperation = "create";
			this.account = {};
			this.password2 = '';
			this.accountDialog = true;
		},
		onEditClick(account) {
			this.crudOperation = "update";
			this.account = {};
			this.account._id = account._id;
			this.account.name = account.name;
			this.account.email = account.email;
			this.account.password = '';
			this.password2 = '';
			this.accountDialog = true;
		},
		onDeleteClick(account) {
			this.account = account;
			this.deleteAccountDialog = true;
		},
		hideDialog() {
			this.accountDialog = false;
		},
		createAccount() {
			if(!this.account.password) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_password_cannot_empty') });
                return;
            }
            if(!this.password2) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_confirm_password_cannot_empty') });
                return;
            }
			if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_two_passwords_different') });
                return;
            }

			this.accountService.addAccount(this.account).then(() => {
				this.accountDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('accountmanagement_account_create_success'), detail: '', life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			})
		},
		editAccount() {
			if(!this.account.password) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_password_cannot_empty') });
                return;
            }
            if(!this.password2) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_confirm_password_cannot_empty') });
                return;
            }
			if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_two_passwords_different') });
                return;
            }

			this.accountService.updateAccount(this.account._id, this.account).then(() => {
				this.accountDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('accountmanagement_account_modify_success'), detail: '', life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			})
		},
		deleteAccount() {
			this.accountService.deleteAccount(this.account._id)
			.then(() => {
				this.deleteAccountDialog = false;
				this.$toast.add({severity: 'info', summary: this.$t('accountmanagement_account_delete_success'), detail: '', life: 5000});
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
		onSearchInput() {
			this.debounce(() => this.search());
		},
		search() {
			this.accountService.findAccounts(this.filters)
			.then(accounts => { 
				this.accounts = accounts; 
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
		showDate(value) {
            return dateFormat(value, "yyyy-mm-dd");
        },
        showTime(value) {
            return dateFormat(value, "HH:MM");
        },
        showDateTime(value) {
            return dateFormat(value, "yyyy-mm-dd HH:MM");
        },
	},
	computed: {
		userInfo() {
            return this.$store.state.authentication.user;
        },
		isAdmin() {
			return this.$store.state.authentication.user && this.$store.state.authentication.user.admin === true;
        },
    },
	watch: {
		isAdmin() {
			if(!this.isAdmin) {
				this.$router.push({path: '/access'});
			}
		}
	},
}
</script>

<style scoped>
:deep(.p-datatable) thead th {
	background-color: RGB(245,245,245);
	color: RGB(29,149,243);
}
	
</style>
