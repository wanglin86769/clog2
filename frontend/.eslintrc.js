module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
	parserOptions: {
		// parser: 'babel-eslint',
		// parser: '@babel/eslint-parser',
		"requireConfigFile": false,
	},
	rules: {
		'no-console': import.meta.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': import.meta.env.NODE_ENV === 'production' ? 'warn' : 'off',
	},
};
