<template>
    <div class="layout-wrapper">
        <div class="layout-main">

            <Menubar :model="items">
                <template #start>
                    <img alt="logo" src="@/assets/images/clog.png" style="vertical-align: middle" height="40" class="p-mr-2">
                </template>
                <template #end>
                    <SplitButton v-if="userInfo" :label="userInfo.email ? userInfo.email.split('@')[0] : ''" icon="fa fa-user" :model="buttonItems"></SplitButton>
                    <Button v-else label="登录" class="p-button-primary" style="width: 100px" @click="onLoginClick" />
                </template>
            </Menubar>

            <!-- <div style="overflow-x: hidden">
                <router-view />
            </div> -->

            <div style="overflow-x: hidden">
				<router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" :key="$route.fullPath" v-if="$route.meta.keepAlive"></component>
                    </keep-alive>
                    <component :is="Component" :key="$route.fullPath" v-if="!$route.meta.keepAlive"></component>
                </router-view>
			</div>
        </div>

        <div class="layout-footer" style="text-align: center">
            <span class="footer-text">{{ softwareUser }}</span>
        </div>

        <Dialog header="消息确认" v-model:visible="logoutDialogDisplay" style="min-width: 300px" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center p-ml-2" style="vertical-align: middle">确定要退出登录吗？</span>
            </div>

            <template #footer>
                <Button label="取消" icon="pi pi-times" @click="logoutDialogDisplay=false" class="p-button-text"/>
                <Button label="确定" icon="pi pi-check" @click="handleLogout" />
            </template>
        </Dialog>

		<Dialog header="账号信息" v-model:visible="showAccountDialogDisplay" style="min-width: 400px" :modal="true">
            <div v-if="userInfo">
                <p><span>邮箱： </span><span>{{ userInfo.email }}</span></p>
                <p><span>姓名： </span><span>{{ userInfo.name }}</span></p>
                <p>
                    <span>管理员： </span>
                    <span>{{ isAdmin ? '是' : '否' }}</span>
                </p>
            </div>

            <template #footer>
                <Button label="关闭" icon="pi pi-times" @click="showAccountDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog header="消息确认" v-model:visible="sessionExpireDialogDisplay" :style="{width: '30vw'}" :modal="true" :closable="false">
            <div style="color: orange; font-weight: bold">
                <i class="fa fa-exclamation-triangle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center p-ml-2" style="vertical-align: middle">会话超时，即将退出登录！</span>
            </div>

            <template #footer>
                <Button label="确定" icon="pi pi-check" @click="handleLogout" />
            </template>
        </Dialog>

    </div>
</template>


<script>
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';
const jwt = require('jsonwebtoken');

export default {
    data() {
        return {
            intervalId: null,
			sessionExpireDialogDisplay: false,

            authenticationService: null,
            logoutDialogDisplay: false,
            showAccountDialogDisplay: false,
            items: [
                {
                   label:'首页',
                   icon:'pi pi-fw pi-home',
                   to: '/'
                },
                {
                   label:'设置',
                   icon:'fa fa-fw fa-cog',
                   items:[
                        {
                            label:'Logbook分组',
                            icon:'fa fa-fw fa-bars',
                            to: '/groupmanagement'
                        },
                        {
                            label:'Logbook',
                            icon:'fa fa-fw fa-book',
                            to: '/logbookmanagement'
                        },
                        {
                            label:'Tag',
                            icon:'fa fa-fw fa-tag',
                            to: '/tagmanagement'
                        },
                        {
                            label:'用户权限',
                            icon:'fa fa-fw fa-lock',
                            to: '/usermanagement',
                            disabled: () => !this.userInfo
                        },
                        {
                            label:'账号管理',
                            icon:'fa fa-fw fa-user',
                            to: '/accountmanagement',
                            disabled: () => !this.isAdmin
                        },
                   ]
                },
                {
                   label:'关于',
                   icon:'pi pi-fw pi-info-circle',
                   to: '/about'
                }
             ],
             buttonItems: [
                {
                    label: '账号信息',
                    icon: 'pi pi-user',
                    command: () => {
                        this.onAccountInfoClick();
                    }
                },
                {
                    label: '退出',
                    icon: 'pi pi-power-off',
                    command: () => {
                        this.onLogoutClick();
                    }
                },
            ]
        }
    },
    watch: {
        $route() {
            
        }
    },
    created () {
        this.authenticationService = new AuthenticationService();

        this.checkSessionStatus();
		this.intervalId = setInterval(this.checkSessionStatus, 60000);
    },
    methods: {
        onAccountInfoClick() {
            this.showAccountDialogDisplay = true;
        },
        onLoginClick() {
            // Save the page before login
            localStorage.setItem(config.localStoragePageBeforeLogin, this.$route.path);

            if(config.loginMethod === 'oauth') {
                this.loginOAuth();
            } else {
                this.loginLocalOrLdap();
            }
        },
        onLogoutClick() {
            this.logoutDialogDisplay = true;
        },
        checkSessionStatus() {
            // console.log("checkSessionStatus");
            const user = JSON.parse(localStorage.getItem(config.localStorageUser));
            if(!user) return;

            let token = user.token;
            // get the decoded payload and header
            let decoded = jwt.decode(token, {complete: true});

            let dateNow = new Date();
            // console.log(decoded.payload.exp);
            // console.log(dateNow / 1000);
            if(decoded.payload.exp < dateNow / 1000) {
                console.log("JWT token expired!!!");
                this.sessionExpireDialogDisplay = true;
            }
        },
        handleLogout() {
            this.$store.dispatch('alert/clear');

            this.$store.dispatch('authentication/logout')
            .then(() => {
                console.log("logout done");
                this.logoutDialogDisplay = false;
                this.sessionExpireDialogDisplay = false;
                if(this.isOauthLogin) {
                    window.location.href = this.authenticationService.oauthLogoutFullUrl();
                }
            })
        },
        loginOAuth() {
            let url = this.authenticationService.oauthFullUrl();
            console.log(url);
            window.location = url;
        },
        loginLocalOrLdap() {
            // this.$router.push('/login');
            let url = '/login';
            window.location = url;
        },
    },
    computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        },
        isAdmin() {
			return this.$store.state.authentication.user && this.$store.state.authentication.user.admin === true;
        },
        isOauthLogin() {
            return config.loginMethod === 'oauth';
        },
        softwareUser() {
            return config.softwareUser;
        },
    },
    components: {
        
    }
}
</script>


<style lang="scss">
@import './App.scss';

</style>
