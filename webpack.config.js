
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, './dist'),
  },
  entry: {
    'index.js': './demo/index.ts',
  },
  devtool:'eval-source-map',
  resolve: {
    extensions: ['.js', '.ts', 'less', '.png', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer', {grid: true, remove: false}],
                ],
              },
            },
          },
          {
            loader: 'less-loader', // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.scss$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer', {grid: true, remove: false}],
                ],
              },
            },
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/env',
                {
                  targets: {
                    browsers: [
                      'last 2 Chrome major versions',
                      'last 2 Firefox major versions',
                      'last 2 Safari major versions',
                      'last 2 Edge major versions',
                      'last 2 iOS major versions',
                      'last 2 ChromeAndroid major versions',
                    ],
                  },
                },
              ],
            ],
          },
        },
      },
      // {
      //   test: /\.png$/,
      //   include: [path.resolve(__dirname, './src/assets/images')],
      //   use: [
      //     'file-loader',
      //   ],
      // },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['index.js'],
      filename: './index.html',
      template: './demo/index.html',
    }),
    // new CopyPlugin({
    //   patterns: [
    //     // {from: 'src/css', to: 'css'},
    //     // {from: 'src/images', to: 'images'},
    //     {from: 'src/js', to: 'js'}
    //   ],
    // }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '.'),
    },
    port: 9001,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: {'^/api': ''},
      },
    },
  },
}
