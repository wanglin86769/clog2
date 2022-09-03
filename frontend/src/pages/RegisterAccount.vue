<template>
    <div>
        <br>
        <br>
        <div class="register">
            <h1>新用户注册</h1>
            <p><span style="color: red">* </span><input type="text" v-model="account.email" placeholder="邮箱"></p>
            <p><span style="color: red">* </span><input type="text" v-model="account.name" placeholder="姓名"></p>
            <p><span style="color: red">* </span><input type="password" v-model="account.password" placeholder="密码"></p>
            <p><span style="color: red">* </span><input type="password" v-model="password2" placeholder="密码确认"></p>
            <p class="submit"><input type="button" value="注册" @click="register"></p>
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
            password2: ''
        }
    },
    accountService: null,
	created() {
		this.accountService = new AccountService();
	},
    methods: {
        register() {
            if(!this.account.email) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '邮箱不能为空！' });
                return;
            }
            if(!this.account.name) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '姓名不能为空！' });
                return;
            }
            if(!this.account.password) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '密码不能为空！' });
                return;
            }
            if(!this.password2) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '密码确认不能为空！' });
                return;
            }

            if(this.account.password !== this.password2) {
                this.$toast.add({ severity: 'error', summary: '操作失败', detail: '两次输入的密码不一致！' });
                return;
            }

            this.accountService.registerAccount(this.account)
            .then(() => {
                this.$toast.add({severity:'success', summary: '操作完成', detail:'注册信息已提交，请登录邮箱验证。'});
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
