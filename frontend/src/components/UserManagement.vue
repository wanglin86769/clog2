<template>
	<div class="p-grid">
		<div class="p-col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					用户权限
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

				<DataTable :value="users" dataKey="_id" :paginator="true" :rows="25" :rowHover="true" showGridlines removableSort
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25,50]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users" 
							paginatorPosition="both" responsiveLayout="stack" v-model:first="currentPageFirstIndex">

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
					<Column field="admin" header="管理员" :sortable="true">
						<template #body="slotProps">
							<span v-if="slotProps.data.admin===true">是</span>
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

			<Dialog v-model:visible="userDialog" :header="crudOperation==='create'?'新建用户':crudOperation==='update'?'编辑用户':''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="p-field">
					<span style="color: red">*</span><label> 姓名</label>
					<InputText v-model.trim="user.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="p-field">
					<span style="color: red">*</span><label> 邮箱</label>
					<InputText v-model.trim="user.email" class="p-inputtext-sm" />
				</div>
				<div class="p-field-checkbox">
					<div>管理员</div>
					<InputSwitch v-model="user.admin" style="margin-left: 10px" />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button label="取消" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="创建" icon="pi pi-check" class="p-button-primary" @click="createUser" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button label="取消" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="修改" icon="pi pi-check" class="p-button-primary" @click="editUser" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteUserDialog" header="消息确认" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">确定要删除如下用户吗?</span>
					<div style="text-indent: 3em;">姓名：{{ user.name }}</div>
					<div style="text-indent: 3em;">邮箱：{{ user.email }}</div>
					<div style="text-indent: 3em;">管理员：{{ user.admin ? '是' : '否' }}</div>
				</div>
				<template #footer>
					<Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteUserDialog = false"/>
					<Button label="确定" icon="pi pi-check" class="p-button-primary" @click="deleteUser" />
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
					this.$toast.add({ severity: 'error', summary: '用户信息加载失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '用户信息加载失败', detail: error.message });
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

			this.userService.addUser(this.user).then((user) => {
				this.userDialog = false;
				this.$toast.add({severity: 'info', summary: '用户创建成功', detail: `姓名: ${user.name}\n邮箱: ${user.email}\n管理员: ${user.admin===true?'是':'否'}`, life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		editUser() {
			let loader = this.$loading.show();

			this.userService.updateUser(this.user._id, this.user).then((user) => {
				this.userDialog = false;
				this.$toast.add({severity: 'info', summary: '用户修改成功', detail: `姓名: ${user.name}\n邮箱: ${user.email}\n管理员: ${user.admin===true?'是':'否'}`, life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		deleteUser() {
			let loader = this.$loading.show();

			this.userService.deleteUser(this.user._id)
			.then((user) => {
				this.deleteUserDialog = false;
				this.$toast.add({severity: 'info', summary: '用户删除成功', detail: `姓名: ${user.name}\n邮箱: ${user.email}\n管理员: ${user.admin===true?'是':'否'}`, life: 5000});
				this.loadData();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
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
