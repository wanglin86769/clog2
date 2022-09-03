<template>
    <div class="box">
        <div style="margin-top: 40px; margin-bottom: 100px">
            <span class="p-text-center p-ml-2" style="font-size: 2em; vertical-align: middle; color: RGB(29,149,243); font-weight: bold;">Clog电子日志系统</span>
        </div>

        <div v-if="finish">
            <div v-if="success" style="color: green">
                <h3><i class="fa fa-check-square-o" aria-hidden="true"></i> 邮箱验证成功</h3>
                <p>登录邮箱：{{ account.email }}</p>
                <p>姓名：{{ account.name }}</p>
            </div>
            <div v-else style="color: orange">
                <h3><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> 邮箱验证失败</h3>
                <p>错误信息：{{ message }}</p>
            </div>

            <div style="font-size: 1.2em; margin-top: 100px;">
                <router-link tag="a" :to="'/'">首页</router-link>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <router-link tag="a" :to="'/login'">登录页</router-link>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <router-link tag="a" :to="'/registeraccount'">注册页</router-link>
            </div>
        </div>

        <div v-else style="color: #007bff">
            <h2 class="p-text-center" style="margin-top: 10px"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>邮箱验证中...</h2>
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
                this.message = "登录邮箱：" + account.email;
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

