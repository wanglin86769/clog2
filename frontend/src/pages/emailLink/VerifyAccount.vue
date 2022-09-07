<template>
    <div class="box">
        <div style="margin-top: 40px; margin-bottom: 100px">
            <span class="p-text-center p-ml-2" style="font-size: 2em; vertical-align: middle; color: RGB(29,149,243); font-weight: bold;">{{ $t('global_clog_software') }}</span>
        </div>

        <div v-if="finish">
            <div v-if="success" style="color: green">
                <h3><i class="fa fa-check-square-o" aria-hidden="true"></i> {{ $t('verifyaccount_email_verify_sucdess') }}</h3>
                <p>{{ $t('verifyaccount_login_email') }}: {{ account.email }}</p>
                <p>{{ $t('global_name') }}: {{ account.name }}</p>
            </div>
            <div v-else style="color: orange">
                <h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> {{ $t('verifyaccount_email_verify_fail') }}</h3>
                <p>{{ $t('verifyaccount_error_message') }}: {{ message }}</p>
            </div>

            <div style="font-size: 1.2em; margin-top: 100px;">
                <router-link tag="a" :to="'/'">{{ $t('global_home_page') }}</router-link>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <router-link tag="a" :to="'/login'">{{ $t('global_login_page') }}</router-link>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <router-link tag="a" :to="'/registeraccount'">{{ $t('global_register_page') }}</router-link>
            </div>
        </div>

        <div v-else style="color: #007bff">
            <h2 class="p-text-center" style="margin-top: 10px"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>{{ $t('verifyaccount_email_verifying') }}</h2>
        </div>
        
    </div>
</template>

<script>

import AccountService from '@/service/AccountService';

export default {

    data() {
        return {
            account: {},
            finish: false,
            success: false,
            message: ''  
        }
    },
    accountService: null,

    created() {
		this.accountService = new AccountService();
	},
	mounted() {
        this.verifyAccount();
	},

    methods: {
        verifyAccount() {
            this.accountService.verifyAccount(this.$route.params.random)
            .then((account) => {
                this.account = account;
                this.finish =true;
                this.success = true;
                this.message = `${this.$t('verifyaccount_login_email')}: ${account.email}`;
            }).catch((error) => {
                this.account = {};
                this.finish =true;
                this.success = false;
                this.message = error.response ? error.response.data.message : error.message;
            });
        },
        
    },
}
</script>

<style scoped>
.box {
    text-align: center;
    border: 3px darkcyan ridge;
    width: 80%;
    background: lightcyan;
    padding: 20px;
    margin: 0 auto;
    margin-top: 100px
}

</style>

