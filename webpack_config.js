const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'none',
  devtool: 'sourcemap',
  entry: [
    path.resolve(__dirname, 'src')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'jsx-runtime.js',
    library: '',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          'babel-loader',
          'eslint-loader'
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  externals: [nodeExternals()]
}
