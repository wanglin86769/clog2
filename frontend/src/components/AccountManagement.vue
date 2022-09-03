<template>
	<div class="p-grid">
		<div class="p-col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					账号管理
				</div>

				<Toolbar class="p-mb-0">
					<template v-slot:start>
						<Button v-if="isAdmin" label="添加" icon="pi pi-plus" class="p-button-success p-button-sm p-mr-2" @click="onAddClick" />
					</template>

					<template v-slot:end>
						<span class="p-input-icon-left">
							<i class="pi pi-search" style="color: RGB(29,149,243)" />
							<InputText class="p-inputtext-sm" @input="onSearchInput" v-model="filters.search" placeholder="姓名、邮箱" />
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

					<Column field="name" header="序号">
						<template #body="slotProps">
							{{currentPageFirstIndex + slotProps.index + 1}}
						</template>
					</Column>
					<Column field="name" header="姓名">
						<template #body="slotProps">
							{{slotProps.data.name}}
						</template>
					</Column>
					<Column field="email" header="邮箱" :sortable="true">
						<template #body="slotProps">
							{{slotProps.data.email}}
						</template>
					</Column>
					<Column field="email" header="密码" >
						<template #body>
							**********
						</template>
					</Column>
					<Column field="email" header="创建时间" :sortable="true">
						<template #body="slotProps">
							{{ showDateTime(slotProps.data.createdAt) }}
						</template>
					</Column>
					<Column field="email" header="确认时间" :sortable="true">
						<template #body="slotProps">
							{{ showDateTime(slotProps.data.verifiedAt) }}
						</template>
					</Column>
					<Column field="email" header="更新时间" :sortable="true">
						<template #body="slotProps">
							{{ showDateTime(slotProps.data.updatedAt) }}
						</template>
					</Column>
					<Column headerStyle="width: 8em">
						<template #header>
							<i class="pi pi-cog" style="fontSize: 1.2rem" v-tooltip.top="'操作'"></i>
						</template>
						<template #body="slotProps">
							<i v-if="isAdmin" class="fa fa-pencil" v-tooltip.top="'编辑'" style="cursor: pointer; color: orange; margin-right: .75em" @click="onEditClick(slotProps.data)"></i>
							<i v-if="isAdmin" class="fa fa-close" v-tooltip.top="'删除'" style="cursor: pointer; color: red; margin-right: .75em" @click="onDeleteClick(slotProps.data)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: darkorange">
							暂无数据
						</div>
					</template>
				</DataTable>
			</div>

			<Dialog v-model:visible="accountDialog" :header="crudOperation==='create'?'新建账号':crudOperation==='update'?'编辑账号':''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="p-field">
					<span style="color: red">* </span><label>姓名</label>
					<InputText v-model.trim="account.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="p-field">
					<span style="color: red">* </span><label>邮箱</label>
					<InputText v-model.trim="account.email" class="p-inputtext-sm" />
				</div>
				<div class="p-field">
					<span style="color: red">* </span><label>密码</label>
					<Password v-model="account.password" class="p-inputtext-sm" :feedback="false" toggleMask />
				</div>
				<div class="p-field">
					<span style="color: red">* </span><label>密码确认</label>
					<Password v-model="password2" class="p-inputtext-sm" :feedback="false" toggleMask />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button label="取消" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="创建" icon="pi pi-check" class="p-button-primary" @click="createAccount" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button label="取消" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="修改" icon="pi pi-check" class="p-button-primary" @click="editAccount" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteAccountDialog" header="消息确认" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange; font-size: 1.2em;">确定要删除如下账号吗?</span>
					<div style="text-indent: 3em;">姓名：{{ account.name }}</div>
					<div style="text-indent: 3em;">邮箱：{{ account.email }}</div>
				</div>
				<template #footer>
					<Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteAccountDialog = false"/>
					<Button label="确定" icon="pi pi-check" class="p-button-primary" @click="deleteAccount" />
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
					this.$toast.add({ severity: 'error', summary: '账号信息加载失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '账号信息加载失败', detail: error.message });
				}
			});
		},
		onAddClick() {
			this.crudOperation = "create";
			this.account = {};
			this.accountDialog = true;
		},
		onEditClick(account) {
			this.crudOperation = "update";
			this.account = {};
			this.account._id = account._id;
			this.account.name = account.name;
			this.account.email = account.email;
			this.account.password = account.password;
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
			if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '两次输入的密码不一致！' });
                return;
            }

			this.accountService.addAccount(this.account).then((account) => {
				this.accountDialog = false;
				this.$toast.add({severity: 'info', summary: '账号创建成功', detail: `姓名: ${account.name}\n邮箱: ${account.email}`, life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
				}
			})
		},
		editAccount() {
			if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '两次输入的密码不一致！' });
                return;
            }

			this.accountService.updateAccount(this.account._id, this.account).then((account) => {
				this.accountDialog = false;
				this.$toast.add({severity: 'info', summary: '账号修改成功', detail: `姓名: ${account.name}\n邮箱: ${account.email}`, life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
				}
			})
		},
		deleteAccount() {
			this.accountService.deleteAccount(this.account._id)
			.then((account) => {
				this.deleteAccountDialog = false;
				this.$toast.add({severity: 'info', summary: '账号删除成功', detail: `姓名: ${account.name}\n邮箱: ${account.email}`, life: 5000});
				this.loadData();
			}).catch(error => {
				// loader.hide();
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
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
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
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
::v-deep .p-datatable thead th {
	background-color: RGB(245,245,245);
	color: RGB(29,149,243);
}
	
</style>
