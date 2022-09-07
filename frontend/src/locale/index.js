import { createI18n } from 'vue-i18n';
import en from './en.json'
import zh from './zh.json'


const messages = {
    en: en,
    zh: zh,
};
// console.log(messages);

const userLocale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
// console.log(userLocale);
const defaultLocale = userLocale.split('-')[0];
// console.log(defaultLocale);

const i18n = createI18n({
    locale: defaultLocale, // set locale
    fallbackLocale: 'en', // set fallback locale
    messages, // set locale messages
});


export default i18n;