<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Button :label="$t('global_go_back')" icon="fa fa-arrow-left" class="p-button-help" style="margin-right: 15px" @click="onReturnClick" />
		<Button :label="$t('global_edit')" icon="fa fa-pencil" class="p-button-warning" style="margin-right: 15px" @click="onEditClick" :disabled="!canEditLog" />
		<Button :label="$t('global_delete')" icon="fa fa-trash" class="p-button-danger" style="margin-right: 15px" @click="onDeleteClick" :disabled="!canEditLog" />
		<Button :label="$t('global_reply')" icon="fa fa-mail-reply" class="p-button-success" style="margin-right: 15px" @click="onReplyClick" />
		<Button :label="$t('global_history')" icon="fa fa-info" class="p-button-info" @click="onHistoryClick" :disabled="!log.histories || !log.histories.length" />
		
		<Button icon="fa fa-angle-double-right" v-tooltip.left="$t('logdetail_last')" style="margin-left: 15px; float: right; background-color: Peru; border-color: Peru;" @click="fetchLastLog" />
		<Button icon="fa fa-angle-right" v-tooltip.top="$t('logdetail_next')" style="margin-left: 15px; float: right; background-color: Peru; border-color: Peru;" @click="fetchNextLog" />
		<Button icon="fa fa-angle-left" v-tooltip.top="$t('logdetail_previous')" style="margin-left: 15px; float: right; background-color: Peru; border-color: Peru;" @click="fetchPreviousLog" />
		<Button icon="fa fa-angle-double-left" v-tooltip.top="$t('logdetail_first')" style="margin-left: 15px; float: right; background-color: Peru; border-color: Peru;" @click="fetchFirstLog" />
		
		<Card class="shadow-2">
            <template #title>
                <!-- {{ $t('logdetail_title') }} -->
				<span style="vertical-align: middle;">{{ log.title }}</span>
				<Badge v-if="log.draft===true" value="Draft" severity="warning" size="large" rounded style="vertical-align: middle; background-color: RGB(255, 208, 208); margin-left: 1em;"></Badge>
            </template>
            <template #subtitle>
				<span v-if="log && log.updatedBy && log.updatedAt" v-tooltip="{ value: creator, disabled: !showCreator }">
					<span style="margin-right: 10px">
						<i class="fa fa-user-o" style="vertical-align: middle; color: RGB(29,149,243); margin-right: 2px;"></i>
						<span style="vertical-align: middle">{{ log.updatedBy.name }}</span>
					</span>
					<span style="margin-right: 10px">
						<i class="fa fa-envelope-o" style="vertical-align: middle; color: RGB(29,149,243); margin-right: 2px;"></i>
						<span style="vertical-align: middle">{{ log.updatedBy.email }}</span>
					</span>
					<span style="margin-right: 10px">
						<i class="fa fa-pencil-square-o" style="vertical-align: middle; color: RGB(29,149,243); margin-right: 2px;"></i>
						<span style="vertical-align: middle">{{ showDateTime(log.updatedAt) }}</span>
					</span>
				</span>
            </template>
            <template #content>
				<table border="1" width="100%">
                    <tr height="40em">
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_logbook') }}</span></td>
                        <td width="80%" align="left"><span v-if="log && log.logbook" style="margin-left: 0.8em;">{{ log.logbook.name }}</span></td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_tag') }}</span></td>
                        <td align="left">
							<span style="margin-left: 0.8em;">
								<span v-for="(item, index) in log.tags" :key="index">
									<span v-if="item">
										<span v-if="index > 0">, </span>
										<span>{{ item.name }}</span>
									</span>
								</span>
							</span>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_category') }}</span></td>
                        <td align="left">
							<span style="margin-left: 0.8em;">{{ log.category }}</span>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left"><span style="margin-left: 0.8em; font-weight: bold;">{{ $t('global_log_title') }}</span></td>
                        <td align="left">
							<span style="margin-left: 0.8em;">{{ log.title }}</span>
						</td>
                    </tr>
					<tr height="40em">
                        <td align="left" colspan="2">
							<div v-if="log.encoding === 'HTML'" v-html="log.description" class="ck-content" style="padding: 10px" ></div>
							<div v-else class="descriptionBox" >
								{{ log.description }}
							</div>
							<div style="margin-top: .8em; margin-bottom: .8em; padding: 10px;">
								<span style="font-weight: bold; margin-right: 1em;">Encoding:</span>
								<span>{{ log.encoding ? log.encoding : 'plain' }}</span>
							</div>
						</td>
                    </tr>
                </table>
				<Panel v-if="log && log.attachments && log.attachments.length" :header="$t('global_log_attachment')" :toggleable="true">
					<div class="grid" style="margin-top: 2em">
						<div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="(attachment, index) in log.attachments" :key="index" style="padding: 1em;">
							<div v-if="imageMimeTypes.includes(attachment.contentType)">
								<!-- <Image :src="attachmentUrl(log._id, attachment.name)" alt="Attachment Image" width="200" preview /> -->
								<el-image
									style="width: 200px"
									:src="attachmentUrl(log._id, attachment.name)"
									:zoom-rate="1.2"
									:max-scale="7"
									:min-scale="0.2"
									:preview-src-list="previewSrcList"
									:initial-index="attachment.index"
									:infinite="false"
									fit="cover"
								/>
								<div id="attachmentLink" style="cursor: pointer;" @click="openAttachment(log._id, attachment.name)">
									<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
									<span>{{ Math.round(attachment.size/1000) }} KB</span>
								</div>
							</div>
							<div v-else>
								<img alt="Attachment File" :src="attachmentIcon(attachment.name)" width="150" style="cursor: pointer;" @click="downloadAttachment(log._id, attachment.name)" />
								<div id="attachmentLink" style="cursor: pointer;" @click="downloadAttachment(log._id, attachment.name)">
									<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
									<span>{{ Math.round(attachment.size/1000) }} KB</span>
								</div>
							</div>
						</div>
					</div>
				</Panel>
            </template>
        </Card>

		<Card v-if="replies && replies.length" class="shadow-2" style="margin-top: 2em">
			<template #title>
				<div>{{ $t('global_reply') }}</div>
            </template>
			<template #content>
				<Panel v-for="(reply, index) in replies" :key="index" class="p-shadow-1" style="margin-bottom: 2em;">
					<template #header>
						<span v-if="reply.updatedAt && reply.updatedBy">
							<i class="fa fa-user-circle-o" style="color: rgb(33,150,243); margin-right: .2em"></i>
							<span style="margin-right: 1em">{{ reply.updatedBy.name }}</span>
							<i class="fa fa-pencil-square-o" style="color: rgb(33,150,243); margin-right: .2em"></i>
							<span>{{ showDateTime(reply.updatedAt) }}</span>
						</span>
					</template>
					<template #icons>
						<span v-if="canEditReply(reply)" style="color: rgb(59,130,246); text-decoration: underline; cursor: pointer; margin-right: 1em;" @click="onEditReplyClick(reply)">{{ $t('global_edit') }}</span>
						<span v-if="canEditReply(reply)" style="color: rgb(239,68,68); text-decoration: underline; cursor: pointer;" @click="onDeleteReplyClick(reply)">{{ $t('global_delete') }}</span>
					</template>
					<div>
						<div v-if="reply.encoding === 'HTML'" v-html="reply.description" class="ck-content" style="padding: 10px" ></div>
						<div v-else class="descriptionBox" >
							{{ reply.description }}
						</div>
					</div>
					<div class="grid" style="margin-top: 2em">
						<div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="(attachment, index) in reply.attachments" :key="index" style="padding: 1em;">
							<div v-if="imageMimeTypes.includes(attachment.contentType)">
								<Image :src="attachmentUrl(reply._id, attachment.name)" alt="Attachment Image" width="200" preview />
								<div id="attachmentLink" style="cursor: pointer;" @click="openAttachment(reply._id, attachment.name)">
									<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
									<span>{{ Math.round(attachment.size/1000) }} KB</span>
								</div>
							</div>
							<div v-else>
								<img alt="Attachment File" :src="attachmentIcon(attachment.name)" width="150" style="cursor: pointer;" @click="downloadAttachment(log._id, attachment.name)" />
								<div id="attachmentLink" style="cursor: pointer;" @click="downloadAttachment(reply._id, attachment.name)">
									<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
									<span>{{ Math.round(attachment.size/1000) }} KB</span>
								</div>
							</div>
						</div>
					</div>
				</Panel>
			</template>
		</Card>

		<div style="margin-bottom: 2em;">
			<Button :label="$t('global_go_back')" icon="fa fa-arrow-left" class="p-button-help" style="margin-right: 15px" @click="onReturnClick" />
		</div>

		<Dialog v-model:visible="deleteLogDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
				<span style="color: orange; font-size: 1.2em;">{{ $t('logdetail_delete_log_prompt') }}</span>
			</div>
			<template #footer>
				<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteLogDialog = false"/>
				<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteLog" />
			</template>
		</Dialog>

		<Dialog v-model:visible="deleteReplyDialog" :header="$t('global_message')" :modal="true" style="min-width: 40%">
			<div>
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2em; color: orange; vertical-align: middle;" />
				<span style="color: orange; font-size: 1.2em;">{{ $t('logdetail_delete_reply_prompt') }}</span>
			</div>
			<template #footer>
				<Button :label="$t('global_cancel')" icon="pi pi-times" class="p-button-text" @click="deleteReplyDialog = false"/>
				<Button :label="$t('global_ok')" icon="pi pi-check" class="p-button-primary" @click="deleteReply" />
			</template>
		</Dialog>

		<Dialog v-model:visible="logHistoryDialog" :modal="true" class="p-fluid" :style="{width: '80vw'}">
			<template #header>
				<div style="font-size: 1.2em; color: RGB(29,149,243);">{{ $t('global_modification_history') }}</div>
			</template>

			<DataTable :value="histories" :showGridlines="true">
				<Column :header="$t('global_index')">
					<template #body="slotProps">
						{{slotProps.index + 1}}
					</template>
				</Column>
				<Column field="category" :header="$t('global_log_category')"></Column>
				<Column field="tags" :header="$t('global_log_tag')">
					<template #body="slotProps">
						<span v-for="(item, index) in slotProps.data.tags" :key="index">
							<span v-if="item">
								<span v-if="index > 0">, </span>
								<span>{{ item.name }}</span>
							</span>
						</span>
					</template>
				</Column>
				<Column field="title" :header="$t('global_log_title')" headerStyle="width: 15%"></Column>
				<Column field="description" :header="$t('global_log_description')" headerStyle="width: 35%"></Column>
				<Column field="attachments" :header="$t('global_log_attachment')" headerStyle="width: 15%">
					<template #body="slotProps">
						<div v-for="(item, index) in slotProps.data.attachments" :key="index">
							<span>{{ item.name }}</span>
						</div>
					</template>
				</Column>
				<Column field="updatedAt" :header="$t('global_log_last_update')">
					<template #body="slotProps">
						<span>{{ showDateTime(slotProps.data.updatedAt) }}</span>
						&nbsp;&nbsp;
						<span v-if="slotProps.data.updatedBy">{{ slotProps.data.updatedBy.name }}</span>
					</template>
				</Column>
			</DataTable>					

			<template #footer>
				<Button :label="$t('global_close')" icon="pi pi-times" class="p-button-text" @click="logHistoryDialog=false"/>
			</template>
		</Dialog>
	</div>
</template>

<script>
import fileDownload from 'js-file-download';
import LogService from '../service/LogService';
import dateFormat from "dateformat";

export default {
	data() {
		return {
			tags: [],
			categories: [],
			log: {},
			deleteLogDialog: false,
			deleteReplyDialog: false,

			histories: [],
			logHistoryDialog: false,

			imageMimeTypes: ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'],
			previewSrcList: [],

			replies: [],
			selectedReply: null,
		}
	},

	logService: null,

	created() {
		this.logService = new LogService();
	},

	mounted() {
		this.fetchLog();
		this.fetchLogReplies();
	},

	methods: {
		processAttachments(log) {
			let attachments = log.attachments;
			if(!attachments || !attachments.length)  return;
			
			this.previewSrcList = [];
			let index = 0;

			for(let attachment of attachments) {
				if(this.imageMimeTypes.includes(attachment.contentType)) {
					// Add image index
					attachment.index = index++;
					// Build preview source list
					let url = this.attachmentUrl(log._id, attachment.name);
					this.previewSrcList.push(url);
				}
			}
		},
		fetchLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

            this.logService.findLog(this.$route.params.id)
            .then(log => {
                this.log = log;
				this.processAttachments(log);
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
            });
        },
		fetchLogReplies() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

            this.logService.findLogReplies(this.$route.params.id)
            .then(replies => {
                this.replies = replies;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
            });
        },
		fetchFirstLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

			let loader = this.$loading.show();
            this.logService.findFirstLog(this.$route.params.id)
            .then(log => {
                if(log && log._id) {
					this.$router.push({ name: 'logdetail', params: { id: log._id } });
				} else {
					this.$toast.add({severity: 'info', summary: this.$t('global_success'), detail: this.$t('logdetail_already_first'), life: 5000});
				}
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		fetchLastLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

			let loader = this.$loading.show();
            this.logService.findLastLog(this.$route.params.id)
            .then(log => {
                if(log && log._id) {
					this.$router.push({ name: 'logdetail', params: { id: log._id } });
				} else {
					this.$toast.add({severity: 'info', summary: this.$t('global_success'), detail: this.$t('logdetail_already_last'), life: 5000});
				}
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		fetchPreviousLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

			let loader = this.$loading.show();
            this.logService.findPreviousLog(this.$route.params.id)
            .then(log => {
                if(log && log._id) {
					this.$router.push({ name: 'logdetail', params: { id: log._id } });
				} else {
					this.$toast.add({severity: 'info', summary: this.$t('global_success'), detail: this.$t('logdetail_already_first'), life: 5000});
				}
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		fetchNextLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

			let loader = this.$loading.show();
            this.logService.findNextLog(this.$route.params.id)
            .then(log => {
                if(log && log._id) {
					this.$router.push({ name: 'logdetail', params: { id: log._id } });
				} else {
					this.$toast.add({severity: 'info', summary: this.$t('global_success'), detail: this.$t('logdetail_already_last'), life: 5000});
				}
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
        },
		deleteLog() {
			this.logService.deleteLog(this.$route.params.id).then(() => {
				this.deleteLogDialog = false;
                this.$router.push({name: 'logbook', params: { id: this.log.logbook._id }});
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t("global_fail"), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t("global_fail"), detail: error.message });
				}
            });
		},
		deleteReply() {
			this.logService.deleteLog(this.selectedReply._id).then(() => {
				this.deleteReplyDialog = false;
                this.fetchLogReplies();
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t("global_fail"), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t("global_fail"), detail: error.message });
				}
            });
		},
		onReturnClick() {
			this.$router.push({name: 'logbook', params: { id: this.log.logbook._id }});
		},
		onEditClick() {
			this.$router.push({name: 'logedit', params: { id: this.$route.params.id }});
		},
		onDeleteClick() {
			this.deleteLogDialog = true;
		},
		onReplyClick() {
			this.$router.push({name: 'logreply', params: { id: this.$route.params.id }});
		},
		onEditReplyClick(reply) {
			this.$router.push({name: 'logreplyedit', params: { id: reply._id }});
		},
		onDeleteReplyClick(reply) {
			this.selectedReply = reply;
			this.deleteReplyDialog = true;
		},
		onHistoryClick() {
			if(!this.log.histories || !this.log.histories.length)  return;

			this.histories = [];
			this.histories.push(this.log);

			for(let i = this.log.histories.length - 1; i >= 0; i--) {
				this.histories.push(this.log.histories[i]);
			}

			// console.log(this.histories);

			this.logHistoryDialog = true;
		},
		attachmentUrl(logId, fileName) {
            return this.logService.attachmentUrl(logId, fileName);
        },
		attachmentIcon(fileName) {
            return this.logService.attachmentIcon(fileName);
        },
        openAttachment(logId, fileName) {
            window.open(this.attachmentUrl(logId, fileName));
        },
        downloadAttachment(logId, fileName) {
            this.logService.findAttachment(logId, fileName)
            .then((attachment) => {
                fileDownload(attachment, fileName);
            }).catch(error => {
                this.$toast.add({ severity: 'error', summary: this.$t("global_fail"), detail: error.message });
            });
        },
		canEditReply(reply) {
			// Clog admin can edit the reply
			if(this.isAdmin) {
				return true;
			}
			// Reply author can edit the reply
			if(reply && reply.createdBy && this.userInfo && reply.createdBy.email === this.userInfo.email) {
				return true;
			}
			// Logbook admin can edit the reply
			if(reply && reply.logbook && reply.logbook.admins && this.userInfo && reply.logbook.admins.includes(this.userInfo.email)) {
				return true;
			}
			return false;
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
		canEditLog() {
			// Clog admin can edit the log
			if(this.isAdmin) {
				return true;
			}
			// Log author can edit the log
			if(this.log && this.log.createdBy && this.userInfo && this.log.createdBy.email === this.userInfo.email) {
				return true;
			}
			// Logbook admin can edit the log
			if(this.log && this.log.logbook && this.log.logbook.admins && this.userInfo && this.log.logbook.admins.includes(this.userInfo.email)) {
				return true;
			}
			return false;
		},
		creator() {
			if(!this.log || !this.log.createdBy || !this.log.updatedBy) return null;
			return `Created at: ${this.log.createdBy.name}    ${this.log.createdBy.email}    ${this.showDateTime(this.log.createdAt)}\nUpdated at: ${this.log.updatedBy.name}    ${this.log.updatedBy.email}    ${this.showDateTime(this.log.updatedAt)}`;
		},
		showCreator() {
			return this.log && this.log.createdBy && this.log.createdAt && this.log.updatedBy && this.log.updatedAt;
		},
    },
}
</script>

<style scoped>
table, th, td {
	border-collapse: collapse;
	border: 1px solid lightgray;
}

.descriptionBox {
	margin: 0px; 
    padding: 10px;
    color: black;
    min-height: 100px;
	white-space: pre-wrap;
}

/* Does not take effect yet */ 
:deep(.p-tooltip) .p-tooltip-text {
	width: 500px !important;
	background: #3f4b5b;
	color: rgba(255, 255, 255, 0.87);
}

/* Remove border of ckeditor */
:deep(.ck) {
    border:0px !important;
}

</style>
