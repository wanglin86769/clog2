<template>
    <div style="text-align: center; border: 3px darkcyan ridge; width: 50%; background: lightcyan; padding: 20px; margin: 0 auto; margin-top: 100px">
        <div style="margin-top: 40px; margin-bottom: 100px">
            <!-- <img alt="logo" src="@/assets/images/clog.png" style="vertical-align: middle" height="35" class="mr-0"> -->
            <span class="text-center ml-2" style="font-size: 2em; vertical-align: middle; color: RGB(29,149,243); font-weight: bold;">{{ $t('global_clog_software') }}</span>
        </div>

        <div v-if="alert && alert.message" style="color: orange">
            <div>
                <i class="fa fa-exclamation-triangle fa-3x" style="vertical-align: middle"></i>
                <span class="text-center ml-2" style="font-size: 1.8em; vertical-align: middle">{{ $t('oauth_login_fail') }}</span>
            </div>
            <h2 class="text-center" style="margin-top: 10px">{{ alert.message }}</h2>
            <Button :label="$t('oauth_return_home')" style="margin-top: 30px" @click="logoutAndLogin" />
        </div>

        <div v-else style="color: #007bff">
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            <h2 class="text-center" style="margin-top: 10px">{{ $t('oauth_logging_in') }}</h2>
        </div>
    </div>
</template>

<script>

import AuthenticationService from '../service/AuthenticationService';

export default {

    data() {
        return {
            authenticationService: null
        }
    },

    created() {
        // console.log("OAuth created()");
        // console.log(this.$route.path);
        // console.log(this.$route.query.code);

        this.authenticationService = new AuthenticationService();

        this.$store.dispatch('alert/clear');

        this.$store.dispatch('authentication/loginOAuth', this.$route.query.code)
            .then(() => {
                console.log('login Success');

            })
            .catch((error) => {
                console.log('login Failed');
                console.log(error);
            });
            
    },

    methods: {
        logoutAndLogin() {
            // console.log("test!!!");
            this.$store.dispatch('authentication/logout')
            .then(() => {
                console.log("logout done");
                window.location.href = this.authenticationService.oauthLogoutFullUrl();
            })
        }
    },

    computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        },
        alert() {
            return this.$store.state.alert;
        }
    }

}
</script>

<style scoped>

</style>

