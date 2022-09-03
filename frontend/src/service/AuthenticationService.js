import axios from 'axios';
import config from '../config/configuration.js';

export default class AuthenticationService {

    /***  
     * Global function
     * 
     */
    isloggedIn() {
        const user = JSON.parse(localStorage.getItem(config.localStorageUser));
        return user ? true : false;
    }

    authHeader() {
        // return authorization header with jwt token
        let user = JSON.parse(localStorage.getItem(config.localStorageUser));
    
        if (user && user.token) {
            return { 'Authorization': 'Bearer ' + user.token };
        } else {
            return {};
        }
    }

    /***  
     * Local database login
     * 
     */
    loginLocal(username, password) {
        let uri = `${config.serverPath}/authenticate/local`;

        return axios.post(uri, { username: username, password: password })
            .then((response) => {
                let jwt = response.data;
                if(jwt.auth && jwt.token && jwt.user) {
                    localStorage.setItem(config.localStorageUser, JSON.stringify(jwt));
                }
                return jwt;
            }).catch ((error) => {
                return Promise.reject(error);
            })
    }

    /***  
     * LDAP login
     * 
     */
     loginLdap(username, password) {
        let uri = `${config.serverPath}/authenticate/ldap`;

        return axios.post(uri, { username: username, password: password })
            .then((response) => {
                let jwt = response.data;
                if(jwt.auth && jwt.token && jwt.user) {
                    localStorage.setItem(config.localStorageUser, JSON.stringify(jwt));
                }
                return jwt;
            }).catch ((error) => {
                return Promise.reject(error);
            })
    }

    /***  
     * OAuth login
     * 
     */
    loginOAuth(code) {

        let url = `${config.serverPath}/authenticate/oauth?code=${code}`;
        let tokenFullUrl = this.oauthTokenFullUrl(code);

        return axios.post(url, { url: tokenFullUrl })
            .then((response) => {
                console.log('response success');
                let jwt = response.data;
                if(jwt.auth && jwt.token && jwt.user) {
                    localStorage.setItem(config.localStorageUser, JSON.stringify(jwt));
                }
                return jwt;
            }).catch ((error) => {
                console.log('response error');
                if(error.response && error.response.data)
                    return Promise.reject(error.response.data.message);
                else
                    return Promise.reject(error);
            })
    }

    /***  
     * Logout for all of local, ldap and oauth
     * 
     */
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem(config.localStorageUser);
    }

    /***  
     * Urls for OAuth
     * 
     */
    oauthFullUrl() {
        let url = `${config.oauthUrl}?response_type=code&redirect_uri=${config.redirectUrl}&client_id=${config.clientID}&theme=full`;
        return url;
    }


    oauthTokenFullUrl(code) {
        let url = `${config.tokenUrl}?client_id=${config.clientID}&client_secret=${config.clientSecret}&grant_type=authorization_code&redirect_uri=${config.redirectUrl}&code=${code}`;
        return url;
    }


    oauthLogoutFullUrl() {
        let url = `${config.logoutUrl}?WebServerURL=${config.homePage}`;
        return url;
    }
 
}

