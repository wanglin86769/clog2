<template>
    <div>
        <br>
        <br>
        <div class="register">
            <h1>找回密码</h1>
            <p><input type="text" v-model="account.email" placeholder="邮箱"></p>
            <p class="submit"><input type="button" value="确定" @click="forgetPassword"></p>
        </div>

        <div class="register-help">
            <a href="/login">登录页</a>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <a href="/">首页</a>
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
            this.accountService.forgetPassword(this.account)
            .then(() => {
                this.$toast.add({severity:'success', summary: '操作完成', detail:'请登录邮箱重置密码'});
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
        }
        
    },
}
</script>

<style scoped>


</style>
