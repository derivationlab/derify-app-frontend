const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const P = (p) => path.join(__dirname, p)

module.exports = {
  devServer: {
    port: 3890
  },
  webpack: {
    alias: {
      '@': P('src')
    },
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/')
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      })
    ],
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        webpackConfig.plugins.push(
          new TerserPlugin({
            extractComments: false,
            terserOptions: {
              format: {
                comments: false
              },
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log']
              }
            }
          })
        )
      }
      return webpackConfig
    }
  }
}
