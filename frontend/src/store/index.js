import { createStore } from 'vuex'
import { alert } from './alert_store';
import { authentication } from './authentication_store';


export const store = createStore({
    modules: {
        alert,
        authentication
    }
})
