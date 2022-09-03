import AuthenticationService from '@/service/AuthenticationService';
import router from '@/router.js';
import config from "@/config/configuration.js";

const authenticationService = new AuthenticationService();

const jwt = JSON.parse(localStorage.getItem(config.localStorageUser));
const initialState = jwt && jwt.user
    ? { status: { loggedIn: true },
        user: jwt.user
      }
    : { status: {}, user: null };

export const authentication = {
    namespaced: true,
    state: initialState,
    actions: {
        loginLocal({ dispatch, commit }, { username, password }) {
            commit('loginRequest', null);

            return authenticationService.loginLocal(username, password)
                .then(
                    jwt => {
                        console.log('loginOAuth success');
                        commit('loginSuccess', jwt);
                        dispatch('alert/clear', '', { root: true });
                        // router.push('/');
                        let path = localStorage.getItem(config.localStoragePageBeforeLogin);
                        router.push(path ? path : '/');
                    })
                .catch(
                    error => {
                        console.log('loginOAuth error');
                        commit('loginFailure', error);
                        dispatch('alert/error', error, { root: true });
                        return Promise.reject(error);
                    }
                );
        },

        loginLdap({ dispatch, commit }, { username, password }) {
            commit('loginRequest', null);

            return authenticationService.loginLdap(username, password)
                .then(
                    jwt => {
                        console.log('loginOAuth success');
                        commit('loginSuccess', jwt);
                        dispatch('alert/clear', '', { root: true });
                        // router.push('/');
                        let path = localStorage.getItem(config.localStoragePageBeforeLogin);
                        router.push(path ? path : '/');
                    })
                .catch(
                    error => {
                        console.log('loginOAuth error');
                        commit('loginFailure', error);
                        dispatch('alert/error', error, { root: true });
                        return Promise.reject(error);
                    }
                );
        },

        loginOAuth({ dispatch, commit }, code) {
            commit('loginRequest', null);

            return authenticationService.loginOAuth(code)
                .then(
                    jwt => {
                        console.log('loginOAuth success');
                        commit('loginSuccess', jwt);
                        dispatch('alert/clear', '', { root: true });
                        // router.push('/');
                        let path = localStorage.getItem(config.localStoragePageBeforeLogin);
                        router.push(path ? path : '/');
                    })
                .catch(
                    error => {
                        console.log('loginOAuth error');
                        commit('loginFailure', error);
                        dispatch('alert/error', error, { root: true });
                        return Promise.reject(error);
                    }
                );
        },

        logout({ commit }) {
            authenticationService.logout();
            commit('logout');
            Promise.resolve();
        }
    },
    mutations: {
        loginRequest(state, user) {
            state.status = { loggingIn: true };
            state.user = user;
        },
        loginSuccess(state, jwt) {
            state.status = { loggedIn: true };
            state.user = jwt.user;
        },
        loginFailure(state) {
            state.status = {};
            state.user = null;
            
        },
        logout(state) {
            state.status = {};
            state.user = null;
        }
    }
}
