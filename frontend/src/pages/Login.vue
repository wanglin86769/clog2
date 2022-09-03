<template>
	<div class="login-body">
		<div class="card login-panel p-fluid">
			<div class="login-panel-content">
				<div class="p-grid p-ai-center">
					<div class="p-col-12" style="text-align: center">
						<h2 class="welcome-text">Clog用户登录</h2>
						<span class="guest-sign-in">Sign in to Clog</span>
					</div>
					<div class="p-col-12" style="text-align: left">
						<label class="login-label">用户名</label>
						<div class="login-input">
							<InputText placeholder="Username" v-model="username" autofocus @keyup.enter="handleLogin" />
						</div>
					</div>
					<div class="p-col-12" style="text-align: left">
						<label class="login-label">密码</label>
						<div class="login-input">
							<InputText placeholder="Password" type="password" v-model="password" @keyup.enter="handleLogin" />
						</div>
					</div>
					<div class="p-col-12 button-pane">
						<Button label="登录" @click="handleLogin"/>
					</div>
					<div v-if="isLocalLogin" class="p-col-12 p-md-4 link-pane">
						<button class="p-link" @click="this.$router.push({ name: 'registeraccount' });">注册账号</button>
					</div>
					<div v-if="isLocalLogin" class="p-col-12 p-md-4 link-pane">
						<button class="p-link" @click="this.$router.push({ name: 'forgetpassword' });">找回密码</button>
					</div>
					<div v-if="isLocalLogin" class="p-col-12 p-md-4 link-pane">
						<button class="p-link" @click="this.$router.push({ name: 'updatepassword' });">修改密码</button>
					</div>
					<div v-if="isLdapLogin" class="p-col-12" >
						<div style="text-align: center;">
							<img alt="LDAP" src="@/assets/images/ldap-removebg.png" style="vertical-align: middle" height="100">
						</div>
					</div>
					<div v-if="isOauthLogin" class="p-col-12" >
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
					this.$toast.add({ severity: 'error', summary: '登录失败', detail: '用户名不能为空！' });
					return;
				}
				if(!this.password) {
					this.$toast.add({ severity: 'error', summary: '登录失败', detail: '密码不能为空！' });
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
						this.$toast.add({ severity: 'error', summary: '登录失败', detail: error.response.data.message });
					} else {
						this.$toast.add({ severity: 'error', summary: '登录失败', detail: error.message });
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
						this.$toast.add({ severity: 'error', summary: '登录失败', detail: error.response.data.message });
					} else {
						this.$toast.add({ severity: 'error', summary: '登录失败', detail: error.message });
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