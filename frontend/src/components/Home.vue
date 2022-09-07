<template>
	<div>
		<div class="p-grid">
			<div class="p-col-12">
				<div class="card">
					<table border="1" width="100%" style="border-collapse: collapse;">
						<tr height="50em" style="background-color: RGB(248, 249, 250); font-size: 1.1em;">
							<th width="50%">{{ $t('home_logbook') }}</th>
							<th width="20%">{{ $t('home_log_count') }}</th>
							<th width="30%">{{ $t('home_last_submit') }}</th>
						</tr>
					</table>
					<table v-for="(group, index) in groups" :key="index" border="1" width="100%" style="border-collapse: collapse; border-top-style: hidden;">
						<tr v-if="group && group.logbooks && group.logbooks.length" height="50em" style="background-color: RGB(217, 241, 249); font-size: 1.2em;">
							<td align="left" colspan="3" width="100%"><span style="margin-left: 0.8em; font-weight: bold;">
								<span v-if="group.name">{{ group.name }}</span>
								<span v-else>{{ $t('home_default_group') }}</span>
							</span></td>
						</tr>
						<tr v-for="(logbook, index) in group.logbooks" :key="index" height="50em" @click="onRowClick(logbook)">
							<td width="50%" align="left">
								<i class="fa fa-book" style="margin-left: 2em; vertical-align: middle; color: mediumorchid; margin-right: .5em;"></i>
								<span style="vertical-align: middle" class="logbook-link" @click="onLogbookClick(logbook)">{{ logbook.name }}</span>
							</td>
							<td width="20%" align="center"><span style="margin-left: 0.8em;" class="logbook-link" @click="onLogbookClick(logbook)">{{ logbook.entries }}</span></td>
							<td width="30%" align="center">
								<div v-if="logbook.lastSubmittedAt" class="logbook-link" @click="onLogbookClick(logbook)">
									<span style="margin-right: 1em;">{{ showDateTime(logbook.lastSubmittedAt) }}</span>
									<span v-if="logbook.lastSubmittedBy">{{ logbook.lastSubmittedBy.name }}</span>
								</div>
								<div v-else class="logbook-link" @click="onLogbookClick(logbook)">----</div>
							</td>
						</tr>
					</table>
					<table v-if="!groups || !groups.length" border="1" width="100%" style="border-collapse: collapse;">
						<tr height="50em" >
							<th style="text-align: left;"><span style="margin-left: 1em; color: orange;">{{ $t('global_no_data') }}</span></th>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import LogbookService from '@/service/LogbookService';
import dateFormat from "dateformat";

export default {
	data() {
		return {
			groups: [],
		}
	},
	logbookService: null,
	created() {
		this.logbookService = new LogbookService();
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.logbookService.findLogbooksDetail()
			.then(groups => this.groups = groups)
			.catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('home_logbook_load_error'), detail: error.response.data.message });
				} else {
                    this.$toast.add({ severity: 'error', summary: this.$t('home_logbook_load_error'), detail: error.message });
				}
			});
		},
		onLogbookClick(logbook) {
			this.$router.push({ name: 'logbook', params: { id: logbook._id } });
		},
		onRowClick(logbook) {
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
                this.onRowDoubleClick(logbook);
            }
        },
		onRowDoubleClick(logbook) {
			this.$router.push({ name: 'logbook', params: { id: logbook._id } });			
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

table, th, td {
  border-collapse: collapse;
  border: 1px solid lightgray;
}

table tr:hover{  
    background: #f1f1f1;
}

.logbook-link:hover {
	text-decoration: underline;
	cursor: pointer;
	color: RGB(29,149,243);
}

</style>
