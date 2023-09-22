const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const _path = (p) => path.join(__dirname, p)

module.exports = {
  devServer: {
    port: 3890
  },
  babel: {
    plugins: [
      [
        'babel-plugin-import',
        {
          libraryName: '@arco-design/web-react',
          libraryDirectory: 'es',
          camel2DashComponentName: false,
          style: 'css'
        }
      ]
    ]
  },
  webpack: {
    alias: {
      '@': _path('src')
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
                // drop_console: true,
                // drop_debugger: true,
                // pure_funcs: ['console.log']
              }
            }
          })
        )
      }
      return webpackConfig
    }
  }
}
