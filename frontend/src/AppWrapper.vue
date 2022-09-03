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
    import Login from './pages/Login';
    import RegisterAccount from './pages/RegisterAccount';
    import VerifyAccount from './pages/emailLink/VerifyAccount';
    import UpdatePassword from './pages/UpdatePassword';
    import ForgetPassword from './pages/ForgetPassword';
    import ResetPassword from './pages/emailLink/ResetPassword';
    

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
