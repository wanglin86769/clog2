<template>
    <div>
        <br>
        <br>
        <div class="register">
            <h1>找回密码</h1>
            <p><input type="password" v-model="account.password" placeholder="密码"></p>
            <p><input type="password" v-model="password2" placeholder="密码确认"></p>
            <p class="submit"><input type="button" value="重置" @click="resetPassword"></p>
        </div>

        <div class="register-help">
            <a href="/login">登录页</a>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <a href="/reset">首页</a>
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
            if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '两次输入的密码不一致！' });
                return;
            }

            this.accountService.resetPassword(this.$route.params.random, this.account)
            .then(() => {
                this.$toast.add({severity:'success', summary: '操作完成', detail:'密码已重置。'});
                this.reset();
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: '操作失败', detail: error.message });
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
