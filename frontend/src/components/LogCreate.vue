<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Card class="p-shadow-2" style="margin-bottom: 2em;">
            <template #title>
                新建日志
            </template>
            <!-- <template #subtitle>
                Subtitle
            </template> -->
            <template #content>
				<table border="1" width="100%">
                    <tr height="40em">
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">Logbook</span></td>
                        <td width="80%" align="left"><span style="margin-left: 0.8em;">{{ logbook.name }}</span></td>
                    </tr>
                    <tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">作者</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.name }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">作者邮箱</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.email }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">标签</span></td>
                        <td align="left">
							<MultiSelect style="min-width: 200px; margin-left: 0.4em;" v-model="log.tags" :options="tags" optionLabel="name" optionValue="_id" placeholder="请选择" display="chip"/>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">类别</span></td>
                        <td align="left">
							<Dropdown style="min-width: 200px; margin-left: 0.4em;" v-model="log.category" :options="categories" placeholder="请选择" />
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">标题</span></td>
                        <td align="left">
							<InputText style="min-width: 500px; margin-left: 0.4em;" type="text" v-model="log.title" placeholder=""/>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left" colspan="2" style="padding: 10px;">
							<Textarea v-model="log.description" placeholder="请输入日志内容" :autoResize="true" rows="5" style="width: 100%;" />
						</td>
                    </tr>
                </table>
				<Panel header="附件" :toggleable="true">
					<div>
						<input type="file" id="file" ref="file" multiple v-on:change="handleFileUpload()"/>
					</div>
				</Panel>
            </template>
            <template #footer>
				<Button icon="pi pi-check" label="创建" @click="createLog" />
				<Button icon="pi pi-times" label="取消" class="p-button-secondary" style="margin-left: 1em" @click="onCancelClick" />
			</template>
        </Card>

		<Dialog v-model:visible="discardLogDialog" header="消息确认" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
				<span style="color: orange; font-size: 1.2em;">确定要放弃编辑当前日志吗?</span>
			</div>
			<template #footer>
				<Button label="取消" icon="pi pi-times" class="p-button-text" @click="discardLogDialog = false"/>
				<Button label="确定" icon="pi pi-check" class="p-button-primary" @click="discardLog" />
			</template>
		</Dialog>
	</div>
	
</template>
<script>
import LogService from '../service/LogService';
import LogbookService from '../service/LogbookService';
import TagService from '../service/TagService';

export default {
	data() {
		return {
			tags: [],
			categories: [],
			log: {},
			logbook: {},
			submittingAttachments: [],
			discardLogDialog: false,
		}
	},

	logService: null,
	logbookService: null,
	tagService: null,

	created() {
		this.logService = new LogService();
		this.logbookService = new LogbookService();
		this.tagService = new TagService();

		this.log.logbook = this.$route.params.logbookid;
	},

	mounted() {
		// Permission guard
		if(!this.userInfo) {
			this.$router.push({path: '/access'});
			return;
		}

		this.fetchLogbook();
		this.fetchTags();
		this.fetchCategories();

		if(this.categories && this.categories.length) {
			this.log.category = this.categories[0];
		}
		// console.log(this.log);
	},

	methods: {
		fetchLogbook() {
			if(!this.$route.params.logbookid) {
				console.log('Logbook id not found.');
				return;
			}

            this.logbookService.findLogbook(this.$route.params.logbookid)
            .then(logbook => {
                this.logbook = logbook;
            });
        },
		fetchTags() {
            this.tagService.findTags()
            .then(tags => {
                this.tags = tags;
            });
        },
		fetchCategories() {
            this.categories = LogService.categories;
        },
		onCancelClick() {
			this.discardLogDialog = true;
		},
		createLog() {
			let loader = this.$loading.show();

			let formData = new FormData();
            formData.append('log', JSON.stringify(this.log));
			for(let i=0; i<this.submittingAttachments.length; i++) {
                formData.append('attachments', this.submittingAttachments[i]);
            }

            this.logService.addLogFormData(formData)
			.then(() => {
                this.$router.push({name: 'logbook', params: { id: this.$route.params.logbookid }});
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: '日志创建失败', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: '日志创建失败', detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		discardLog() {
			this.$router.push({name: 'logbook', params: { id: this.$route.params.logbookid }});
		},
		handleFileUpload(){
            this.submittingAttachments = this.$refs.file.files;
            // console.log(this.submittingAttachments);
        },
	},

	computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        }
    },

	watch: {
		userInfo() {
			if(!this.userInfo) {
				this.$router.push({path: '/access'});
			}
		}
	},
}
</script>

<style scoped>
table, th, td {
  border-collapse: collapse;
  border: 1px solid lightgray;
}
</style>
