const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  watch: true, // Tắt watch mode mặc định, chỉ bật khi dùng --watch flag
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
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'app'),
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [require('tailwindcss'), require('autoprefixer')]
              }
            }
          }
        ]
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
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: 'eval'
};
