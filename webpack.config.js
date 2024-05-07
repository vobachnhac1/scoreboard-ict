const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  watch: true,
  entry: {
    app: './app/index.js'
  },
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, './public'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        // use: {
        //   loader: 'file-loader',
        //   options: {
        //     limit: 8192,
        //     name: 'assets/[name].[ext]'
        //   }
        // }
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.ejs'
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: './app/favicon.ico' }, { from: './app/assets', to: 'assets' }]
    })
  ],
  devtool: 'eval'
};
