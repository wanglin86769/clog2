import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('./components/Home.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('./pages/Login.vue'),
    },
    {
        path: '/oauth/redirect',
        name: 'oauth',
        component: () => import('./components/OAuth.vue'),
    },
    {
        path: '/registeraccount',
        name: 'registeraccount',
        component: () => import('./pages/RegisterAccount.vue'),
    },
    {
        path: '/verifyaccount/:random',
        name: 'verifyaccount',
        component: () => import('./pages/emailLink/VerifyAccount.vue'),
    },
    {
        path: '/updatepassword',
        name: 'updatepassword',
        component: () => import('./pages/UpdatePassword.vue'),
    },
    {
        path: '/forgetpassword',
        name: 'forgetpassword',
        component: () => import('./pages/ForgetPassword.vue'),
    },
    {
        path: '/resetpassword/:random',
        name: 'resetpassword',
        component: () => import('./pages/emailLink/ResetPassword.vue'),
    },
    {
        path: '/usermanagement',
        name: 'usermanagement',
        component: () => import('./components/UserManagement.vue'),
    },
    {
        path: '/accountmanagement',
        name: 'accountmanagement',
        component: () => import('./components/AccountManagement.vue'),
    },
    {
        path: '/logbookmanagement',
        name: 'logbookmanagement',
        component: () => import('./components/LogbookManagement.vue'),
    },
    {
        path: '/tagmanagement',
        name: 'tagmanagement',
        component: () => import('./components/TagManagement.vue'),
    },
    {
        path: '/groupmanagement',
        name: 'groupmanagement',
        component: () => import('./components/GroupManagement.vue'),
    },
    {
        path: '/logbook/:id',
        name: 'logbook',
        meta: { keepAlive: true },
        component: () => import('./components/Logbook.vue'),
    },
    {
        path: '/logcreate/:logbookid',
        name: 'logcreate',
        component: () => import('./components/LogCreate.vue'),
    },
    {
        path: '/logedit/:id',
        name: 'logedit',
        component: () => import('./components/LogEdit.vue'),
    },
    {
        path: '/logdetail/:id',
        name: 'logdetail',
        component: () => import('./components/LogDetail.vue'),
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('./components/About.vue'),
    },
    {
		path: '/access',
		name: 'access',
		component: () => import('./components/Access.vue')
	},
    {
        path: "/:catchAll(.*)",
        name: 'notfound',
        component: () => import('./components/NotFound.vue')
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
