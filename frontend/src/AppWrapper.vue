<template>
    <div>
        <Toast />
        
        <Login v-if="$route.path === '/login'" />
        <RegisterAccount v-else-if="$route.path === '/registeraccount'" />
        <VerifyAccount v-else-if="$route.path.includes('/verifyaccount')" />
        <UpdatePassword v-else-if="$route.path === '/updatepassword'" />
        <ForgetPassword v-else-if="$route.path === '/forgetpassword'" />
        <ResetPassword v-else-if="$route.path.includes('/resetpassword')" />
        <App v-else />
    </div>
</template>

<script>
    import App from './App.vue';
    import Login from './pages/Login.vue';
    import RegisterAccount from './pages/RegisterAccount.vue';
    import VerifyAccount from './pages/emailLink/VerifyAccount.vue';
    import UpdatePassword from './pages/UpdatePassword.vue';
    import ForgetPassword from './pages/ForgetPassword.vue';
    import ResetPassword from './pages/emailLink/ResetPassword.vue';
    

	export default {
        data() {
            return {

            }
        },
        methods: {
            
        },
        components: {
            "App": App,
            "Login": Login,
            "RegisterAccount": RegisterAccount,
            "VerifyAccount": VerifyAccount,
            "UpdatePassword": UpdatePassword,
            "ForgetPassword": ForgetPassword,
            "ResetPassword": ResetPassword
        }
	}
</script>

<style scoped>
</style>
