<template>
	<div class="p-grid">
		<div class="p-col-12">
			<div class="card">
				<div style="text-align: center; color: RGB(29,149,243); font-size: 1.8em; font-weight: bold; margin-bottom: .5em;">
					Tag信息
				</div>

				<Button v-if="userInfo && isAdmin" label="添加" icon="pi pi-plus" style="margin-bottom: 5px" class="p-button-success p-button-sm p-mr-2" @click="onAddClick" />
				
				<DataTable :value="tags" dataKey="_id" :rowHover="true" showGridlines responsiveLayout="stack">
					<Column field="name" header="序号">
						<template #body="slotProps">
							{{slotProps.index + 1}}
						</template>
					</Column>
					<Column field="name" header="名称">
						<template #body="slotProps">
							{{slotProps.data.name}}
						</template>
					</Column>
					<Column field="number" header="编号">
						<template #body="slotProps">
							{{slotProps.data.number}}
						</template>
					</Column>
					<Column headerStyle="width: 8em">
						<template #header>
							<i class="pi pi-cog" style="fontSize: 1.2rem" v-tooltip.top="'操作'"></i>
						</template>
						<template #body="slotProps">
							<i v-if="userInfo && isAdmin" class="fa fa-pencil" v-tooltip.top="'编辑'" style="cursor: pointer; color: orange; margin-right: .75em" @click="onEditClick(slotProps.data)"></i>
							<i v-if="userInfo && isAdmin" class="fa fa-close" v-tooltip.top="'删除'" style="cursor: pointer; color: red; margin-right: .75em" @click="onDeleteClick(slotProps.data)"></i>
						</template>
					</Column>
					<template #empty>
						<div style="color: darkorange">
							暂无数据
						</div>
					</template>
				</DataTable>
			</div>

			<Dialog v-model:visible="tagDialog" :header="crudOperation==='create'?'新建Tag':crudOperation==='update'?'编辑Tag':''" :modal="true" class="p-fluid" style="min-width: 40%">
				<div class="p-field">
					<span style="color: red">*</span><label> 名称</label>
					<InputText v-model.trim="tag.name" class="p-inputtext-sm" autofocus />
				</div>
				<div class="p-field">
					<span style="color: red">*</span><label> 编号</label>
					<InputText v-model.trim="tag.number" class="p-inputtext-sm" />
				</div>

				<template #footer>
					<div v-if="crudOperation==='create'">
						<Button label="取消" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="创建" icon="pi pi-check" class="p-button-primary" @click="createTag" />
					</div>
					<div v-if="crudOperation==='update'">
						<Button label="取消" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="修改" icon="pi pi-check" class="p-button-primary" @click="editTag" />
					</div>
				</template>
			</Dialog>

			<Dialog v-model:visible="deleteTagDialog" header="消息确认" :modal="true" style="min-width: 40%">
				<div>
					<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
					<span style="color: orange">确定要删除如下Tag吗?</span>
					<div style="text-indent: 3em;">名称：{{ tag.name }}</div>
					<div style="text-indent: 3em;">编号：{{ tag.number }}</div>
				</div>
				<template #footer>
					<Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteTagDialog = false"/>
					<Button label="确定" icon="pi pi-check" class="p-button-primary" @click="deleteTag" />
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
					this.$toast.add({ severity: 'error', summary: 'Tag信息加载失败', detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: 'Tag信息加载失败', detail: error.message });
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

			this.tagService.addTag(this.tag).then((tag) => {
				this.tagDialog = false;
				this.$toast.add({severity: 'info', summary: 'Tag创建成功', detail: `名称: ${tag.name}\n编号: ${tag.number}\n`, life: 5000});
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
		editTag() {
			let loader = this.$loading.show();

			this.tagService.updateTag(this.tag._id, this.tag).then((tag) => {
				this.tagDialog = false;
				this.$toast.add({severity: 'info', summary: 'Tag修改成功', detail: `名称: ${tag.name}\n编号: ${tag.number}`, life: 5000});
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
		deleteTag() {
			let loader = this.$loading.show();

			this.tagService.deleteTag(this.tag._id)
			.then((tag) => {
				this.deleteTagDialog = false;
				this.$toast.add({severity: 'info', summary: 'Tag删除成功', detail: `名称: ${tag.name}\n编号: ${tag.number}`, life: 5000});
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
