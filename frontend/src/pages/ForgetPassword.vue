<template>
    <div>
        <br>
        <br>
        <div class="register">
            <h1>{{ $t('global_retrieve_password') }}</h1>
            <p><input type="text" v-model="account.email" :placeholder="$t('global_email')"></p>
            <p class="submit"><input type="button" :value="$t('global_ok')" @click="forgetPassword"></p>
        </div>

        <div class="register-help">
            <a href="/login">{{ $t('global_login_page') }}</a>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <a href="/">{{ $t('global_home_page') }}</a>
        </div>
    </div>
</template>

<script>
import AccountService from '../service/AccountService';

export default {
    data() {
        return {
            account: {},
        }
    },
    accountService: null,
	created() {
		this.accountService = new AccountService();
	},
    methods: {
        forgetPassword() {
            if(!this.account.email) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_email_cannot_empty') });
                return;
            }

            this.accountService.forgetPassword(this.account)
            .then(() => {
                this.$toast.add({severity:'success', summary: this.$t('global_success'), detail: this.$t('forgetpassword_login_email_reset')} );
                this.reset();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: error.message });
				}
			});
        },

        reset() {
            this.account = {};
        }
        
    },
}
</script>

<style scoped>


</style>
