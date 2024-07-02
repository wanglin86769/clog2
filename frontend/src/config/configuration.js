export default {
    localStorageUser: "clogUser",
    localStoragePageBeforeLogin: "clogPageBeforeLogin",


    // Login options: "local", "ldap", "oauth"
    loginMethod: "local",  
    // loginMethod: "ldap",
    // loginMethod: "oauth",


    // The is software user rather than software copyright, the copyright of
    // this software can be found at license file or about page.
    softwareUser: "中国科学院高能物理研究所（IHEP）",
    // Software copyright
    softwareCopyright: "Copyright © 2022 中国科学院高能物理研究所（IHEP）",


    oauthUrl: 'https://login.csns.ihep.ac.cn/oauth2/authorize',
    tokenUrl: 'https://login.csns.ihep.ac.cn/oauth2/token',
    logoutUrl: 'https://login.csns.ihep.ac.cn/logout',


    // Development environment
    homePage: 'http://localhost:8080',
    serverPath: "http://localhost:3000/api",
    clientID: '81622',
    clientSecret: 'aoJp1DIgDEwQ5bU8ioU5tpwh9XLFIfoz',
    redirectUrl: 'http://10.1.44.253:8080/oauth/redirect',


    // Production environment
    // homePage: 'http://accdev.csns.ihep.ac.cn',
    // serverPath: "http://accdev.csns.ihep.ac.cn:3000/api",
    // clientID: '56214',
    // clientSecret: 'x70qk44Dhcb2FMXQoBgIjN2bsJ9lHDVW',
    // redirectUrl: 'http://accdev.csns.ihep.ac.cn/oauth/redirect',
}