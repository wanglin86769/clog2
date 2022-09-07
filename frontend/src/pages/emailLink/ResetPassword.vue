<template>
    <div>
        <br>
        <br>
        <div class="register">
            <h1>{{ $t('global_retrieve_password') }}</h1>
            <p><input type="password" v-model="account.password" :placeholder="$t('global_password')"></p>
            <p><input type="password" v-model="password2" :placeholder="$t('global_confirm_password')"></p>
            <p class="submit"><input type="button" :value="$t('global_reset')" @click="resetPassword"></p>
        </div>

        <div class="register-help">
            <a href="/login">{{ $t('global_login_page') }}</a>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <a href="/reset">{{ $t('global_home_page') }}</a>
        </div>
    </div>
</template>

<script>
import AccountService from '@/service/AccountService';

export default {
    data() {
        return {
            account: {},
            password2: ''
        }
    },
    accountService: null,
	created() {
		this.accountService = new AccountService();
        console.log(this.account);
	},
    methods: {
        resetPassword() {
            if(!this.account.password) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_password_cannot_empty') });
                return;
            }
            if(!this.password2) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_confirm_password_cannot_empty') });
                return;
            }
            if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_two_passwords_different') });
                return;
            }

            this.accountService.resetPassword(this.$route.params.random, this.account)
            .then(() => {
                this.$toast.add({severity:'success', summary: this.$t('global_success'), detail: this.$t('resetpassword_password_has_reset') });
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
            this.password2 = '';
        }
        
    },
}
</script>

<style scoped>


</style>
