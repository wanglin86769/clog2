<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div v-if="logbook" style="text-align: center; font-size: 1.8em; font-weight: bold; margin-bottom: .2em;">
					<i class="fa fa-book" style="vertical-align: middle; color: mediumorchid;"></i>
					<span style="vertical-align: middle; color: RGB(29,149,243); margin-left: .2em;">{{ logbook.name }}</span>
					<Button :label="$t('logbook_summary_display')" severity="info" size="small" style="float: right" outlined @click="switchToSummaryDisplay" />
				</div>
				<Toolbar class="mb-0">
					<template #start>
						<Button :label="$t('global_go_back')" icon="fa fa-arrow-left" class="p-button-help" style="margin-right: 15px" @click="onReturnClick" />
					</template>

					<template #end>
						<div class="p-inputgroup">
							<Button :label="$t('global_reset')" icon="pi pi-refresh" class="p-button-success p-button-sm" @click="resetSearch"/>
							<InputText :placeholder="$t('logbook_search')" style="width: 20em" class="p-inputtext-sm" v-model="filters.search" @input="onSearchInput" />
							<Button :label="$t('global_advanced')" icon="pi pi-caret-down" class="p-button-primary p-button-sm" style="background-color: Peru; border-color: Peru;" @click="toggleSearch"/>
						</div>
					</template>
				</Toolbar>

				<DataView :value="logs" layout="list" :paginator="true" :rows="25"
							paginatorPosition="both" :pageLinkSize="5" ref="dt" v-model:first="currentPageFirstIndex"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
							:lazy="true" :totalRecords="totalRecords" @page="onPage($event)">
					<template #list="slotProps">
						<div class="col-12">
							<table border="1" width="100%" style="border-collapse: collapse">
								<tr height="40em">
									<td width="5%" align="center" class="tableHeader">{{ $t('global_index') }}</td>
									<td width="10%" align="center" class="tableHeader">{{ $t('global_log_date') }}</td>
									<td width="10%" align="center" class="tableHeader">{{ $t('global_log_author') }}</td>
									<td width="15%" align="center" class="tableHeader">{{ $t('global_log_author_email') }}</td>
									<td width="15%" align="center" class="tableHeader">{{ $t('global_log_tag') }}</td>
									<td width="10%" align="center" class="tableHeader">{{ $t('global_log_category') }}</td>
									<td align="center" class="tableHeader">{{ $t('global_log_title') }}</td>
								</tr>
								<tr height="40em">
									<td align="center" class="tableData">
										<span v-if="slotProps.data.draft" style="color: orangered">Draft</span>
										<span v-else>{{ currentPageFirstIndex + slotProps.index + 1 }}</span>
									</td>
									<td align="center" class="tableData">{{ showDateTime(slotProps.data.updatedAt) }}</td>
									<td align="center" class="tableData">{{ slotProps.data.updatedBy.name }}</td>
									<td align="center" class="tableData">{{ slotProps.data.updatedBy.email }}</td>
									<td align="center" class="tableData">
										<span v-for="(item, index) in slotProps.data.tags" :key="index">
											<span v-if="item">
												<span v-if="index > 0">, </span>
												<span>{{ item.name }}</span>
											</span>
										</span>
									</td>
									<td align="center" class="tableData">{{ slotProps.data.category }}</td>
									<td align="center" class="tableData">{{ slotProps.data.title }}</td>
								</tr>
								<tr height="40em">
									<td colspan="7">
										<div v-if="slotProps.data.encoding === 'HTML'" v-html="slotProps.data.description" class="ck-content" style="padding: 20px 10px 20px 10px" ></div>
										<div v-else class="descriptionBox" >
											{{ slotProps.data.description }}
										</div>
										<!-- <div style="padding: 10px;">
											<span style="font-weight: bold; margin-right: 1em;">Encoding:</span>
											<span>{{ slotProps.data.encoding ? slotProps.data.encoding : 'plain' }}</span>
										</div> -->
									</td>
								</tr>
								<tr height="40em" v-if="showAttachments && slotProps.data.attachments && slotProps.data.attachments.length">
									<td colspan="7">
										<Panel :header="$t('global_log_attachment')" :toggleable="true">
											<div class="grid" style="margin-top: 2em">
												<div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="(attachment, index) in slotProps.data.attachments" :key="index" style="padding: 1em;">
													<div v-if="imageMimeTypes.includes(attachment.contentType)">
														<!-- <Image :src="attachmentUrl(slotProps.data._id, attachment.name)" alt="Attachment Image" width="200" preview /> -->
														<el-image
															style="width: 200px"
															:src="attachmentUrl(slotProps.data._id, attachment.name)"
															:zoom-rate="1.2"
															:max-scale="7"
															:min-scale="0.2"
															:preview-src-list="slotProps.data.previewSrcList"
															:initial-index="attachment.index"
															:infinite="false"
															fit="cover"
														/>
														<div id="attachmentLink" style="cursor: pointer;" @click="openAttachment(slotProps.data._id, attachment.name)">
															<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
															<span>{{ Math.round(attachment.size/1000) }} KB</span>
														</div>
													</div>
													<div v-else>
														<img alt="Attachment File" :src="attachmentIcon(attachment.name)" width="150" style="cursor: pointer;" @click="downloadAttachment(slotProps.data._id, attachment.name)" />
														<div id="attachmentLink" style="cursor: pointer;" @click="downloadAttachment(slotProps.data._id, attachment.name)">
															<span style="margin-right: 1em; color: rgb(59,130,246);">{{ attachment.name }}</span>
															<span>{{ Math.round(attachment.size/1000) }} KB</span>
														</div>
													</div>
												</div>
											</div>
										</Panel>
									</td>
								</tr>
							</table>
						</div>
					</template>

					<template #empty>
						<div style="color: orange; padding: 10px;">{{ $t('global_no_data') }}</div>
					</template>
				</DataView>
			</div>
		</div>
		<OverlayPanel ref="search">
            <div class="field grid">
				<label class="col-fixed" style="width: 100px">{{ $t('global_start_date') }}</label>
				<div class="col">
					<Calendar v-model="filters.startDate" :showIcon="true" dateFormat="yy-mm-dd" @date-select="onStartDateInput" />
				</div>
			</div>
			<div class="field grid">
				<label class="col-fixed" style="width: 100px">{{ $t('global_end_date') }}</label>
				<div class="col">
					<Calendar v-model="filters.endDate" :showIcon="true" dateFormat="yy-mm-dd" @date-select="onEndDateInput" />
				</div>
			</div>
			<div class="field grid">
				<label class="col-fixed" style="width: 100px">{{ $t('global_show_attachments') }}</label>
				<div class="col">
					<InputSwitch v-model="showAttachments" />
				</div>
			</div>
        </OverlayPanel>
	</div>

</template>

<script>
import LogbookService from '../service/LogbookService';
import TagService from '../service/TagService';
import LogService from '../service/LogService';
// const dateFormat = require('dateformat');
import dateFormat from "dateformat";

export default {
	data() {
		return {
			lazyParams: {},
			totalRecords: 0,
			loading: false,
			currentPageFirstIndex: 0,

			logbook: null,
			logs: null,
			filters: {},

			debounceTimer: null,
			imageMimeTypes: ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'],
			showAttachments: true,
		}
	},
	logbookService: null,
	tagService: null,
	logService: null,
	created() {
		this.logbookService = new LogbookService();
		this.tagService = new TagService();
		this.logService = new LogService();
	},
	mounted() {
		this.fetchLogbook();
		this.resetLazyParams();
		this.loadLazyData();
	},
	methods: {
		switchToSummaryDisplay() {
			this.$router.push({ name: 'logbook', params: { id: this.$route.params.id } });
		},
		fetchLogbook() {
			if(!this.$route.params.id) {
				console.log('Logbook id not found.');
				return;
			}

            this.logbookService.findLogbook(this.$route.params.id)
            .then(logbook => {
                this.logbook = logbook;
            });
        },
		processAllAttachments(logs) {
			if(!logs || !logs.length)  return;
			for(let log of logs) {
				this.processAttachments(log);
			}
		},
		processAttachments(log) {
			let attachments = log.attachments;
			if(!attachments || !attachments.length)  return;
			
			log.previewSrcList = [];
			let index = 0;

			for(let attachment of attachments) {
				if(this.imageMimeTypes.includes(attachment.contentType)) {
					// Add image index
					attachment.index = index++;
					// Build preview source list
					let url = this.attachmentUrl(log._id, attachment.name);
					log.previewSrcList.push(url);
				}
			}
		},
		loadLazyData() {
			this.loading = true;
			this.logService.findLogs(this.$route.params.id, this.lazyParams)
			.then(data => {
				this.logs = data.entries;
				this.totalRecords = data.count;
				this.processAllAttachments(this.logs);
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('logbook_log_load_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('logbook_log_load_error'), detail: error.message });
				}
			}).finally(() => {
				this.loading = false;
			});
		},
		onRowClick(event) {
            if(!this.timeoutId) {
                this.timeoutId = setTimeout(() => {
                    this.timeoutId = null;
                    // simple click
                    // console.log('single click');
                    // this.onRowSingleClick(event);
                }, 200);//tolerance in ms
            } else{
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
                // double click
                // console.log('double click');
                this.onRowDoubleClick(event);
            }
        },
		onRowDoubleClick(event) {
            let log = JSON.parse(JSON.stringify(event.data));
			this.$router.push({ name: 'logdetail', params: { id: log._id } });			
        },
		onReturnClick() {
			this.$router.push({name: 'home'});
		},
        onSort(event) {
            this.lazyParams.first = event.first;
			this.lazyParams.rows = event.rows;
			this.lazyParams.sortField = event.sortField;
			this.lazyParams.sortOrder = event.sortOrder;
            this.loadLazyData();
        },
		onSearchInput() {
			this.debounce(() => this.search());
		},
		onStartDateInput() {
			this.filters.startDate = this.showDate(this.filters.startDate);
			this.search();
		},
		onEndDateInput() {
			this.filters.endDate = this.showDate(this.filters.endDate);
			this.search();
		},
		resetLazyParams() {
			this.lazyParams = {
				first: 0,
				rows: this.$refs.dt.rows,
				sortField: null,
				sortOrder: null,
				filters: null
			};
		},
		search() {
			this.resetLazyParams();
            this.lazyParams.filters = this.filters;
            this.loadLazyData();
        },
		resetSearch() {
			this.filters = {};
			this.resetLazyParams();
            this.loadLazyData();
			this.showAttachments = true;
        },
		toggleSearch(event) {
            this.$refs.search.toggle(event);
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
}
</script>

<style scoped>
	.descriptionBox {
		margin: 0px; 
		padding: 10px;
		color: black;
		min-height: 100px;
		white-space: pre-wrap;
	}

	.tableHeader {
		background-color: RGBA(29,149,243,0.2);
	}

	.tableData {
		background-color: RGBA(104,159,56,0.2);
	}
</style>
