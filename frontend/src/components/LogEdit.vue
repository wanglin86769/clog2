<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Card class="p-shadow-2" style="margin-bottom: 2em;">
            <template #title>
                编辑日志
            </template>
            <!-- <template #subtitle>
                Subtitle
            </template> -->
            <template #content>
				<table border="1" width="100%">
                    <tr height="40em">
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">Logbook</span></td>
                        <td width="80%" align="left"><span v-if="currentLog && currentLog.logbook" style="margin-left: 0.8em;">{{ currentLog.logbook.name }}</span></td>
                    </tr>
                    <!-- <tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">作者</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.name }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">作者邮箱</span></td>
                        <td align="left"><span v-if="userInfo" style="margin-left: 0.8em;">{{ userInfo.email }}</span></td>
                    </tr> -->
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
				<Panel v-if="currentLog && currentLog.attachments && currentLog.attachments.length" header="已有附件" :toggleable="true">
					<div class="p-grid" style="margin-top: 2em">
						<div class="p-col-12 p-md-6 p-lg-4 p-xl-3" v-for="(attachment, index) in currentLog.attachments" :key="index" style="padding: 1em;">
							<div v-if="['image/jpeg', 'image/png', 'image/bmp', 'image/gif'].includes(attachment.contentType)">
								<Image :src="attachmentUrl(log._id, attachment._id)" alt="Attachment Image" width="100" preview />
							</div>
							<div v-else>
								<img alt="Attachment File" src="@/assets/images/fileIcon.png" width="60" style="cursor: pointer;" @click="downloadAttachment(log._id, attachment._id, attachment.name)" />
							</div>
							<div>
								<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
								<span style="margin-right: 1em;">{{ Math.round(attachment.size/1000) }} KB</span>
								<i v-if="attachment.deleting" class="fa fa-ban fa-lg" v-tooltip.top="'取消'" style="cursor: pointer; color: orange; margin-right: .75em" @click="attachment.deleting=false"></i>
								<i v-else class="fa fa-close fa-lg" v-tooltip.top="'删除'" style="cursor: pointer; color: red; margin-right: .75em" @click="attachment.deleting=true"></i>
							</div>
						</div>
					</div>
				</Panel>
				<Panel header="新增附件" :toggleable="true">
					<div>
						<input type="file" id="file" ref="increasefile" multiple v-on:change="handleIncreaseFileUpload()"/>
					</div>
				</Panel>
            </template>
            <template #footer>
				<Button icon="pi pi-check" label="确定" @click="editLog" />
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
import fileDownload from 'js-file-download';
import LogService from '../service/LogService';
import TagService from '../service/TagService';

export default {
	data() {
		return {
			tags: [],
			categories: [],

			currentLog: {},
			log: {},
			discardLogDialog: false,

			submittingAttachments: [],
			increaseAttachments: [],
		}
	},

	logService: null,
	tagService: null,

	created() {
		this.logService = new LogService();
		this.tagService = new TagService();
	},

	mounted() {
		this.fetchLog();
		this.fetchTags();
		this.fetchCategories();
	},

	methods: {
		fetchLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

            this.logService.findLog(this.$route.params.id)
            .then(log => {
                this.currentLog = log;

				this.log._id = log._id;
				this.log.logbook = log.logbook._id;
				if(log.tags && log.tags.length) {
					this.log.tags = log.tags.map(function(a) {return a._id;});
				}
				this.log.category = log.category;
				this.log.title = log.title;
				this.log.description = log.description;
				// console.log(this.log);
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: '当前日志加载失败', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: '当前日志加载失败', detail: error.message });
				}
            })
        },
		fetchTags() {
            this.tagService.findTags()
            .then(tags => {
                this.tags = tags;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Tag加载失败', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Tag加载失败', detail: error.message });
				}
            });
        },
		fetchCategories() {
            this.categories = LogService.categories;
        },
		editLog() {
			let loader = this.$loading.show();

			let formData = new FormData();
            formData.append('log', JSON.stringify(this.log));

			// for (const value of formData.values()) {
			// 	console.log(value);
			// }
			
			let reduceAttachments = [];
            for(let item of this.currentLog.attachments) {
                if(item.deleting) {
                    reduceAttachments.push(item._id);
                }
            }
            formData.append('reduceAttachments', JSON.stringify(reduceAttachments));
            // console.log(reduceAttachments);

            for(let i=0; i<this.increaseAttachments.length; i++) {
                formData.append('attachments', this.increaseAttachments[i]);
            }

            this.logService.editLogFormData(this.log._id, formData).then(() => {
                this.$router.push({name: 'logbook', params: { id: this.currentLog.logbook._id }});
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: '日志编辑失败', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: '日志编辑失败', detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		discardLog() {
			this.$router.push({name: 'logbook', params: { id: this.currentLog.logbook._id }});
		},
		onCancelClick() {
			this.discardLogDialog = true;
		},
		handleIncreaseFileUpload(){
            this.increaseAttachments = this.$refs.increasefile.files;
            // console.log(this.submittingAttachments);
        },
		attachmentUrl(logId, attachmentId) {
            // console.log(this.logService.attachmentUrl(logId, attachmentId));
            return this.logService.attachmentUrl(logId, attachmentId);
        },
        openAttachment(logId, attachmentId) {
            window.open(this.attachmentUrl(logId, attachmentId));
        },
        downloadAttachment(logId, attachmentId, fileName) {
            this.logService.findAttachment(logId, attachmentId)
            .then((attachment) => {
                fileDownload(attachment, fileName);
            }).catch(error => {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
            });
        },
	},

	computed: {
        userInfo() {
            return this.$store.state.authentication.user;
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
