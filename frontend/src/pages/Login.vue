<template>
	<div class="login-body">
		<div class="card login-panel p-fluid">
			<div class="login-panel-content">
				<div class="grid align-items-center">
					<div class="col-12" style="text-align: center">
						<h2 class="welcome-text">{{ $t('login_title') }}</h2>
						<span class="guest-sign-in">Sign in to Clog</span>
					</div>
					<div class="col-12" style="text-align: left">
						<label class="login-label">{{ $t('login_username') }}</label>
						<div class="login-input">
							<InputText placeholder="Username" v-model="username" autofocus @keyup.enter="handleLogin" />
						</div>
					</div>
					<div class="col-12" style="text-align: left">
						<label class="login-label">{{ $t('login_password') }}</label>
						<div class="login-input">
							<InputText placeholder="Password" type="password" v-model="password" @keyup.enter="handleLogin" />
						</div>
					</div>
					<div class="col-12 button-pane">
						<Button :label="$t('login_button')" @click="handleLogin"/>
					</div>
					<div v-if="isLocalLogin" class="col-12 md:col-4 link-pane">
						<button class="p-link" @click="this.$router.push({ name: 'registeraccount' });">{{ $t('login_register_account') }}</button>
					</div>
					<div v-if="isLocalLogin" class="col-12 md:col-4 link-pane">
						<button class="p-link" @click="this.$router.push({ name: 'forgetpassword' });">{{ $t('login_forget_password') }}</button>
					</div>
					<div v-if="isLocalLogin" class="col-12 md:col-4 link-pane">
						<button class="p-link" @click="this.$router.push({ name: 'updatepassword' });">{{ $t('login_change_password') }}</button>
					</div>
					<div v-if="isLdapLogin" class="col-12" >
						<div style="text-align: center;">
							<img alt="LDAP" src="@/assets/images/ldap-removebg.png" style="vertical-align: middle" height="100">
						</div>
					</div>
					<div v-if="isOauthLogin" class="col-12" >
						<div style="text-align: center;">
							<i class="fa fa-exclamation-triangle fa-3x" style="vertical-align: middle; color: orange"></i>
							<span style="color: orange; font-size: 1.2em;">Login method is oauth, should not be here!</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import config from '../config/configuration.js';

	export default {
		data() {
			return {
				username: '',
				password: ''
			}
		},
		mounted() {
			// Already logged in, redirect to home page
			if(this.userInfo) {
				this.$router.push({path: '/'});
				return;
			}
		},
		methods: {
			handleLogin() {
				this.$store.dispatch('alert/clear');

				if(!this.username) {
					this.$toast.add({ severity: 'error', summary: this.$t('login_fail'), detail: this.$t('login_username_cannot_empty') });
					return;
				}
				if(!this.password) {
					this.$toast.add({ severity: 'error', summary: this.$t('login_fail'), detail: this.$t('login_password_cannot_empty') });
					return;
				}

				if(this.isLocalLogin) {
					this.loginLocal();
				} else if(this.isLdapLogin) {
					this.loginLdap();
				} else if(this.isOauthLogin) {
					console.log('Login method is oauth, should not be here.');
				} else {
					console.log('Unknown login method');
				}
			},
			loginLocal() {
				this.$store.dispatch('authentication/loginLocal', { username: this.username, password: this.password })
				.then(() => {
					console.log('login Success');
				})
				.catch((error) => {
					console.log('login Failed');
					console.log(error);
					if(error.response) {
						this.$toast.add({ severity: 'error', summary: this.$t('login_fail'), detail: error.response.data.message });
					} else {
						this.$toast.add({ severity: 'error', summary: this.$t('login_fail'), detail: error.message });
					}
				});
			},
			loginLdap() {
				this.$store.dispatch('authentication/loginLdap', { username: this.username, password: this.password })
				.then(() => {
					console.log('login Success');
				})
				.catch((error) => {
					console.log('login Failed');
					console.log(error);
					if(error.response) {
						this.$toast.add({ severity: 'error', summary: this.$t('login_fail'), detail: error.response.data.message });
					} else {
						this.$toast.add({ severity: 'error', summary: this.$t('login_fail'), detail: error.message });
					}
				});
			},
		},
		computed: {
			userInfo() {
				return this.$store.state.authentication.user;
			},
			isLocalLogin() {
				return config.loginMethod === 'local';
			},
			isLdapLogin() {
				return config.loginMethod === 'ldap';
			},
			isOauthLogin() {
				return config.loginMethod === 'oauth';
			},
		}
	}
</script>

<style scoped>

</style>