const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
	// publicPath: process.env.NODE_ENV === 'production' ? '/clog2' : '/'
	configureWebpack: {
		plugins: [
		  new NodePolyfillPlugin()
		]
	}
}