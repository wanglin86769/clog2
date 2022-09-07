<template>
    <div>
        <br>
        <br>
        <div class="register">
            <h1>{{ $t('updatepassword_change_password') }}</h1>
            <hr>
            <p><input type="text" v-model="account.email" :placeholder="$t('global_email')"></p>
            <p><input type="password" v-model="account.currentPassword" :placeholder="$t('updatepassword_current_password')"></p>
            <hr>
            <!-- <p><input type="text" v-model="account.name" placeholder="姓名"></p> -->
            <p><input type="password" v-model="account.password" :placeholder="$t('global_password')"></p>
            <p><input type="password" v-model="password2" :placeholder="$t('global_confirm_password')"></p>
            <hr>
            <p class="submit"><input type="button" :value="$t('global_modify')" @click="updatePassword"></p>
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
            password2: ''
        }
    },
    accountService: null,
	created() {
		this.accountService = new AccountService();
	},
    methods: {
        updatePassword() {
            if(!this.account.email) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_email_cannot_empty') });
                return;
            }
            if(!this.account.currentPassword) {
                this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: this.$t('global_current_password_cannot_empty') });
                return;
            }
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

            this.accountService.updatePassword(this.account)
            .then(() => {
                this.$toast.add({severity:'success', summary: this.$t('global_success'), detail: this.$t('updatepassword_password_has_updated') });
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
