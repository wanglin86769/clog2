<template>
	<div style="margin-left: 1%; margin-right: 1%; margin-top: 20px;">
		<Button :label="$t('global_go_back')" icon="fa fa-arrow-left" class="p-button-help" style="margin-right: 15px" @click="onReturnClick" />
		<Button :label="$t('global_edit')" icon="fa fa-pencil" class="p-button-warning" style="margin-right: 15px" @click="onEditClick" :disabled="!canEdit" />
		<Button :label="$t('global_delete')" icon="fa fa-trash" class="p-button-danger" style="margin-right: 15px" @click="onDeleteClick" :disabled="!canEdit" />
		<Button :label="$t('global_history')" icon="fa fa-info" class="p-button-info" @click="onHistoryClick" :disabled="!log.histories || !log.histories.length" />
		<Card class="shadow-2" style="margin-bottom: 2em;">
            <template #title>
                {{ $t('logdetail_title') }}
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
                        <td width="20%" align="left"><span style="margin-left: 0.8em; font-weight: bold;">Logbook</span></td>
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
							<div class="descriptionBox" >
								{{ log.description }}
							</div>
						</td>
                    </tr>
                </table>
				<Panel v-if="log && log.attachments && log.attachments.length" :header="$t('global_log_attachment')" :toggleable="true">
					<div class="grid" style="margin-top: 2em">
						<div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="(attachment, index) in log.attachments" :key="index" style="padding: 1em;">
							<div v-if="['image/jpeg', 'image/png', 'image/bmp', 'image/gif'].includes(attachment.contentType)">
								<Image :src="attachmentUrl(log._id, attachment.name)" alt="Attachment Image" width="200" preview />
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

			histories: [],
			logHistoryDialog: false,
		}
	},

	logService: null,

	created() {
		this.logService = new LogService();
	},

	mounted() {
		this.fetchLog();
	},

	methods: {
		fetchLog() {
			if(!this.$route.params.id) {
				console.log('Log id not found.');
				return;
			}

            this.logService.findLog(this.$route.params.id)
            .then(log => {
                this.log = log;
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logdetail_log_load_error'), detail: error.message });
				}
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
		onReturnClick() {
			this.$router.push({name: 'logbook', params: { id: this.log.logbook._id }});
		},
		onEditClick() {
			this.$router.push({name: 'logedit', params: { id: this.$route.params.id }});
		},
		onDeleteClick() {
			this.deleteLogDialog = true;
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
		canEdit() {
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
.p-tooltip ::v-deep .p-tooltip-text {
	width: 500px !important;
	background: #3f4b5b;
	color: rgba(255, 255, 255, 0.87);
}

</style>
