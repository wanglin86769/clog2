<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div v-if="logbook" style="text-align: center; font-size: 1.8em; font-weight: bold; margin-bottom: .2em;">
					<i class="fa fa-book" style="vertical-align: middle; color: mediumorchid;"></i>
					<span style="vertical-align: middle; color: RGB(29,149,243); margin-left: .2em;">{{ logbook.name }}</span>
				</div>
				<Toolbar class="mb-0">
					<template #start>
						<Button :label="$t('global_go_back')" icon="fa fa-arrow-left" class="p-button-help" style="margin-right: 15px" @click="onReturnClick" />
						<Button :label="$t('global_new')" icon="pi pi-plus" class="p-button-primary" style="margin-right: 10px" @click="onNewClick" :disabled="!userInfo" />
					</template>

					<template #end>
						<div class="p-inputgroup">
							<Button :label="$t('global_reset')" icon="pi pi-refresh" class="p-button-success p-button-sm" @click="resetSearch"/>
							<InputText :placeholder="$t('logbook_search')" style="width: 20em" class="p-inputtext-sm" v-model="filters.search" @input="onSearchInput" />
						</div>
					</template>
				</Toolbar>

				<DataTable :value="logs" dataKey="_id" :rows="25" :rowHover="true" showGridlines :removableSort="true"
							:paginator="true" paginatorPosition="both" ref="dt" v-model:first="currentPageFirstIndex"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25,50]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} logs" responsiveLayout="stack"
							:lazy="true" :totalRecords="totalRecords" :loading="loading" @page="onPage($event)" @sort="onSort($event)"
							:rowClass="rowClass" @row-click="onRowClick">
					<template #empty>
						<div style="color: darkorange">
							{{ $t('global_no_data') }}
						</div>
					</template>

					<Column header="" headerStyle="width: 6em; text-align: left">
						<template #header>
							<div style="white-space: nowrap;">{{ $t('global_index') }}</div>
						</template>
						<template #body="slotProps">
							<!-- <span style="color: RGB(33,150,243)">{{currentPageFirstIndex + slotProps.index + 1}}</span> -->
							<span style="color: RGB(33,150,243)">{{ slotProps.index + 1 }}</span>
						</template>
					</Column>
					<Column header="">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_create_date') }}</div>
								<div class="col-12">
									<Dropdown style="width: 100%" class="p-inputtext-sm" :placeholder="$t('global_select')" v-model="filters.year" :options="years" :showClear="true" @change="search()"></Dropdown>
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<span class="logdetail-link" @click="onDetailClick(slotProps.data)">{{ showDate(slotProps.data.createdAt) }}</span>
						</template>
					</Column>
					<Column header="">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_author') }}</div>
								<div class="col-12">
									<InputText style="width: 100%" class="p-inputtext-sm" type="text" v-model="filters.author" :placeholder="$t('global_keyword')" @input="onSearchInput" />
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<span v-if="slotProps.data.createdBy" class="logdetail-link" @click="onDetailClick(slotProps.data)">{{ slotProps.data.createdBy.name }}</span>
						</template>
					</Column>
					<Column header="">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_author_email') }}</div>
								<div class="col-12">
									<InputText style="width: 100%" class="p-inputtext-sm" type="text" v-model="filters.email" :placeholder="$t('global_keyword')" @input="onSearchInput" />
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<span v-if="slotProps.data.createdBy" class="logdetail-link" @click="onDetailClick(slotProps.data)">{{ slotProps.data.createdBy.email }}</span>
						</template>
					</Column>
					<Column header="">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_category') }}</div>
								<div class="col-12">
									<Dropdown style="width: 100%" class="p-inputtext-sm" :placeholder="$t('global_select')" v-model="filters.category" :options="categories" :showClear="true" @change="search()"></Dropdown>
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<span class="logdetail-link" @click="onDetailClick(slotProps.data)">
								{{ slotProps.data.category }}
							</span>
						</template>
					</Column>
					<Column header="">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_tag') }}</div>
								<div class="col-12">
									<Dropdown style="width: 100%" class="p-inputtext-sm" :placeholder="$t('global_select')" v-model="filters.tags" :options="tags" optionLabel="name" optionValue="_id" :showClear="true" @change="search()"></Dropdown>
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<span class="logdetail-link" @click="onDetailClick(slotProps.data)">
								<span v-for="(item, index) in slotProps.data.tags" :key="index">
									<span v-if="item">
										<span v-if="index > 0">, </span>
										<span>{{ item.name }}</span>
									</span>
								</span>
							</span>
						</template>
					</Column>
					<Column header="" headerStyle="width: 15%">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_title') }}</div>
								<div class="col-12">
									<InputText style="width: 100%" class="p-inputtext-sm" type="text" v-model="filters.title" :placeholder="$t('global_keyword')" @input="onSearchInput" />
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<span class="logdetail-link" @click="onDetailClick(slotProps.data)">{{ slotProps.data.title }}</span>
							<i v-if="slotProps.data.histories && slotProps.data.histories.length" style="color: orange; margin-left: .2em;" class="fa fa-clock-o fa-lg" v-tooltip.top="$t('global_modification_history')"></i>
						</template>
					</Column>
					<Column header="" headerStyle="width: 35%">
						<template #header>
							<div class="grid grid-nogutter" style="width: 100%">
								<div class="col-12" style="margin-bottom: 5px; white-space: nowrap;">{{ $t('global_log_description') }}</div>
								<div class="col-12">
									<InputText style="width: 100%" class="p-inputtext-sm" type="text" v-model="filters.description" :placeholder="$t('global_keyword')" @input="onSearchInput" />
								</div>
							</div>
						</template>
						<template #body="slotProps">
							<div style="white-space: pre-wrap" class="logdetail-link" @click="onDetailClick(slotProps.data)">
								<span v-if="slotProps.data.description && slotProps.data.description.length > 50">{{slotProps.data.description.slice(0, 50)}} <span style="color: RGB(29,149,243); font-size: 1.5em;">......</span></span>
								<span v-else>{{ slotProps.data.description }}</span>
							</div>
						</template>
					</Column>
					<Column header="">
						<template #header>
							<div style="white-space: nowrap;">{{ $t('global_log_attachment') }}</div>
						</template>
						<template #body="slotProps">
							<div v-if="slotProps.data.attachments && slotProps.data.attachments.length" style="white-space: nowrap;">
								<!-- <i class="fa fa-paperclip" style="color: orange;"></i> -->
								<img src="@/assets/images/attachment.png" style="vertical-align: middle" width="15" height="15" alt="Attachment">
								<span style="margin-left: 1px; vertical-align: middle;">{{ slotProps.data.attachments.length }}</span>
							</div>
						</template>
					</Column>
				</DataTable>
			</div>
		</div>
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

			tags: [],
			categories: [],
			logbook: null,
			logs: null,
			filters: {},
			currentYear: new Date().getFullYear(),
			years: [],

			debounceTimer: null,
			refreshInterval: null,
			maxTimestamp: null,
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
		this.fetchTags();
		this.fetchCategories();
		
		this.resetLazyParams();

		let past = 10;
		let future = 1;
		for(let i = this.currentYear - past; i <= this.currentYear + future; i++) {
			this.years.push(i);
		}
	},
	activated() {
        // console.log("activated()");
		this.loadLazyData();
		this.startRefresh();
    },
	deactivated() {
        // console.log("deactivated()");
		this.stopRefresh();
    },
	methods: {
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
		fetchTags() {
            this.tagService.findTags()
            .then(tags => {
                this.tags = tags;
            });
        },
		fetchCategories() {
            this.categories = LogService.categories;
        },
		loadLazyData() {
			this.loading = true;
			this.logService.findLogs(this.$route.params.id, this.lazyParams)
			.then(data => {
				this.logs = data.entries;
				this.totalRecords = data.count;
				this.removeHTMLTags(this.logs);
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
		removeHTMLTags(logs) {
			if(!logs || !logs.length) return;
			for(let log of logs) {
				if(!log.description) continue;
				if(log.encoding === 'HTML')
					log.description = log.description.replace(/(<([^>]+)>)/ig, ''); // Remove HTML tags
					log.description = log.description.replace(/&nbsp;/ig, ' '); // Remove the "&nbsp;" HTML entity
			}
		},
		onNewClick() {
			this.$router.push({ name: 'logcreate', params: { logbookid: this.$route.params.id } });
		},
		onDetailClick(log) {
			this.$router.push({ name: 'logdetail', params: { id: log._id } });
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
		onPage(event) {
            this.lazyParams.first = event.first;
			this.lazyParams.rows = event.rows;
			this.lazyParams.sortField = event.sortField;
			this.lazyParams.sortOrder = event.sortOrder;
            this.loadLazyData();
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
		refreshData() {
            this.logService.findLastActive(this.$route.params.id).then((logTimestamp) => {
                if(!logTimestamp || !logTimestamp.lastActive) return;
                let lastActive = logTimestamp.lastActive; 

                if(this.maxTimestamp && new Date(lastActive).getTime() > new Date(this.maxTimestamp).getTime()) {
                    console.log("Detected update, refresh!");
                    this.loadLazyData();
                }

                // console.log(this.maxTimestamp);
                // console.log(lastActive);

                this.maxTimestamp = lastActive;
            });
        },
		startRefresh() {
			this.refreshInterval = setInterval(this.refreshData, 60000);
		},
		stopRefresh() {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		},
		rowClass(data) {
            if (!data) return
			let dateNow = new Date();

			if(data.updatedAt) {
				let updatedAt = new Date(data.updatedAt);
				if (updatedAt.getTime() > dateNow.getTime() - 3 * 60 * 1000) 
					return 'updated-row';
			}

			return null;
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
    }
}
</script>

<style scoped>
	.logdetail-link:hover {
		text-decoration: underline;
		cursor: pointer;
		color: RGB(29,149,243);
	}

	:deep(.updated-row) {
		background-color: powderblue !important;
	}
</style>
