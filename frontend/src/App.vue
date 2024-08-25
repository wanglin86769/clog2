<template>
    <div class="layout-wrapper">
        <div class="layout-main">

            <Menubar :model="menuitems">
                <template #start>
                    <img alt="logo" src="@/assets/images/clog.png" style="vertical-align: middle" height="40" class="mr-2">
                </template>
                <template #end>
                    <SplitButton v-if="userInfo" :label="userInfo.email ? userInfo.email.split('@')[0] : ''" icon="fa fa-user" :model="buttonItems"></SplitButton>
                    <Button v-else :label="$t('app_login')" class="p-button-primary" style="width: 100px" @click="onLoginClick" />
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

        <Dialog :header="$t('global_message')" v-model:visible="logoutDialogDisplay" style="min-width: 800px" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="text-center ml-2" style="vertical-align: middle">{{ $t('app_logout_confirm_message') }}</span>
            </div>

            <template #footer>
                <Button :label="$t('global_cancel')" icon="pi pi-times" @click="logoutDialogDisplay=false" class="p-button-text"/>
                <Button :label="$t('global_ok')" icon="pi pi-check" @click="handleLogout" />
            </template>
        </Dialog>

		<Dialog :header="$t('app_account_information')" v-model:visible="showAccountDialogDisplay" style="min-width: 400px" :modal="true">
            <div v-if="userInfo">
                <p><span style="font-weight: bold">{{ $t('global_email') }}: </span><span>{{ userInfo.email }}</span></p>
                <p><span style="font-weight: bold">{{ $t('global_name') }}: </span><span>{{ userInfo.name }}</span></p>
                <p>
                    <span style="font-weight: bold">{{ $t('global_admin') }}: </span>
                    <span>{{ isAdmin ? $t('global_yes') : $t('global_no') }}</span>
                </p>
            </div>

            <template #footer>
                <Button :label="$t('global_close')" icon="pi pi-times" @click="showAccountDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog :header="$t('global_message')" v-model:visible="sessionExpireDialogDisplay" :style="{width: '30vw'}" :modal="true" :closable="false">
            <div style="color: orange; font-weight: bold">
                <i class="fa fa-exclamation-triangle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="text-center ml-2" style="vertical-align: middle">{{ $t('app_session_expire_message') }}</span>
            </div>

            <template #footer>
                <Button :label="$t('global_ok')" icon="pi pi-check" @click="handleLogout" />
            </template>
        </Dialog>

        <Dialog :header="$t('app_browser_languages')" v-model:visible="browserLanguagesDialogDisplay" :style="{width: '30vw'}" :modal="true" :closable="false">
            <div v-for="(item, index) in browserLanguages" :key="index">
                <i class="fa fa-circle" style="vertical-align: middle; margin-right: .8em; color: orange;"></i>
                <span style="vertical-align: middle; font-size: 1.4em;">{{ item }}</span>
            </div>

            <template #footer>
                <Button :label="$t('global_close')" icon="pi pi-times" @click="browserLanguagesDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog :header="'API token'" v-model:visible="showTokenDialogDisplay" style="min-width: 400px" :modal="true">
            <div>
                {{ $t('token_expiration') }}<span style="color: red; vertical-align: middle;"> *</span>
            </div>
            <Calendar v-model="endDate" :showIcon="true" dateFormat="yy-mm-dd" style="margin-top: 5px; width: 100%;" />

            <div style="margin-top: 20px">API token</div>
            <div style="margin-top: 5px; color: RGB(104,159,56);">
                <div v-if="generatedToken">
                    <span style="color: red">...... </span>
                    {{ generatedToken.slice(-30) }}
                    <i v-tooltip="$t('token_clipboard')" class="fa fa-clipboard" style="vertical-align: middle; color: orange; cursor: pointer; margin-left: 10px;" @click="copyToClipboard()"></i>
                </div>
                <div v-else>N/A</div>
            </div>

            <template #footer>
                <Button :label="$t('token_generate')" icon="fa fa-paper-plane" @click="generateToken()" class="p-button-success" style="float: left"/>
                <Button :label="$t('global_close')" icon="pi pi-times" @click="showTokenDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

    </div>
</template>


<script>
import { Clipboard } from "v-clipboard";
import config from '@/config/configuration.js';
import AuthenticationService from '@/service/AuthenticationService';
import UserService from '@/service/UserService';
import { jwtDecode } from "jwt-decode";

export default {
    data() {
        return {
            intervalId: null,
			sessionExpireDialogDisplay: false,

            authenticationService: null,
            logoutDialogDisplay: false,
            showAccountDialogDisplay: false,

            browserLanguagesDialogDisplay: false,
            browserLanguages: [],

            showTokenDialogDisplay: false,
            endDate: null,
            generatedToken: null,

            menuitems: [],

            buttonItems: [
                {
                    label: this.$t('app_account_information'),
                    icon: 'pi pi-user',
                    command: () => {
                        this.onAccountInfoClick();
                    }
                },
                {
                    label: 'API Token',
                    icon: 'pi pi-key',
                    command: () => {
                        this.onGenerateTokenClick();
                    }
                },
                {
                    label: this.$t('app_logout'),
                    icon: 'pi pi-power-off',
                    command: () => {
                        this.onLogoutClick();
                    }
                },
            ]
        }
    },
    created () {
        this.authenticationService = new AuthenticationService();
        this.userService = new UserService();

        this.checkSessionStatus();
		this.intervalId = setInterval(this.checkSessionStatus, 60000);
    },
    mounted() {
        this.browserLanguages = navigator.languages && navigator.languages.length ? navigator.languages : navigator.language;
        this.updateMenuItems();
    },
    methods: {
        // Menuitems are provided here instead of data are due to a bug of PrimeVUE when trying to add i18n support.
        // If menuitems are provided within data, locale cannot be switched since data is initiated only once.
        // To support i18n, if menuitems are provided as computed property, submenu of menubar cannot be displayed.
        updateMenuItems() {
            this.menuitems = [
                {
                   label: this.$t('menu_home'),
                   icon: 'pi pi-fw pi-home',
                   to: '/'
                },
                {
                   label: this.$t('menu_manage'),
                   icon: 'fa fa-fw fa-paint-brush',
                   items: [
                        {
                            label: this.$t('menu_logbook_grouping'),
                            icon: 'fa fa-fw fa-bars',
                            to: '/groupmanagement'
                        },
                        {
                            label: this.$t('menu_logbook'),
                            icon: 'fa fa-fw fa-book',
                            to: '/logbookmanagement'
                        },
                        {
                            label: this.$t('menu_tag'),
                            icon: 'fa fa-fw fa-tag',
                            to: '/tagmanagement'
                        },
                        {
                            label: this.$t('menu_template'),
                            icon: 'fa fa-fw fa-clone',
                            to: '/templatemanagement'
                        },
                        {
                            label: this.$t('menu_user_management'),
                            icon: 'fa fa-fw fa-lock',
                            to: '/usermanagement',
                            disabled: () => !this.userInfo
                        },
                        {
                            label: this.$t('menu_account_management'),
                            icon: 'fa fa-fw fa-user',
                            to: '/accountmanagement',
                            disabled: () => !this.isAdmin,
                            visible: () => this.isLocalLogin
                        },
                   ]
                },
                {
                   label: this.$t('menu_config'),
                   icon: 'fa fa-fw fa-cog',
                   items: [
                        {
                            label: this.$t('menu_browser_languages'),
                            icon: 'fa fa-fw fa-edge',
                            command: () => { this.browserLanguagesDialogDisplay = true; },
                        },
                        {
                            label: this.$t('menu_multi_language'),
                            icon: 'fa fa-fw fa-globe',
                            items: [
                                {
                                    label: '简体中文',
                                    icon: 'fa fa-fw fa-circle-o',
                                    command: () => { this.$i18n.locale='zh'; },
                                },
                                {
                                    label: 'English',
                                    icon: 'fa fa-fw fa-circle-o',
                                    command: () => { this.$i18n.locale='en'; },
                                },
                            ]
                        },
                   ]
                },
                {
                   label: this.$t('menu_about'),
                   icon: 'pi pi-fw pi-info-circle',
                   to: '/about'
                }
            ];
        },
        onAccountInfoClick() {
            this.showAccountDialogDisplay = true;
        },
        onGenerateTokenClick() {
            this.generatedToken = null;
            this.endDate = null;
            this.showTokenDialogDisplay = true;
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
            const decoded = jwtDecode(token);

            let dateNow = new Date();
            // console.log(decoded.payload.exp);
            // console.log(dateNow / 1000);
            if(decoded.exp < dateNow / 1000) {
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
        generateToken() {
			if(!this.endDate) {
				this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: 'Expiration is required' });
				return;
			}

            const one_second = 1000;
            let dateNow = new Date();
            let expiration = Math.round((this.endDate - dateNow) / one_second);

            if(this.endDate <= dateNow) {
				this.$toast.add({ severity: 'error', summary: this.$t('global_fail'), detail: 'Expiration date must be later then now' });
				return;
			}

            this.loading = true;
			this.userService.generateToken(expiration)
			.then(data => {
				this.generatedToken = data.token;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: this.$t('token_generate_error'), detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: this.$t('token_generate_error'), detail: error.message });
				}
			}).finally(() => {
				this.loading = false;
			});
        },
        copyToClipboard() {
            Clipboard.copy(this.generatedToken);
        },
    },
    computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        },
        isAdmin() {
			return this.$store.state.authentication.user && this.$store.state.authentication.user.admin === true;
        },
        isLocalLogin() {
            return config.loginMethod === 'local';
        },
        isOauthLogin() {
            return config.loginMethod === 'oauth';
        },
        softwareUser() {
            return config.softwareUser;
        },
    },
    watch: {
        '$i18n.locale'() {
            this.updateMenuItems();
        },
    },
    components: {
        
    }
}
</script>


<style lang="scss">
@import './App.scss';

</style>
