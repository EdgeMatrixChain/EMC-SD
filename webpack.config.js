require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const isDevelopment = process.env.NODE_ENV !== 'production';

const frontendDirectory = 'frontend';

module.exports = {
  target: 'web',
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    // The frontend.entrypoint points to the HTML file for this build, so we need
    // to replace the extension to `.js`.
    index: path.join(__dirname, path.join('src', frontendDirectory, 'src', 'main.ts')),
  },
  devtool: isDevelopment ? 'source-map' : false,
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue'],
    alias: {
      '@': path.join(__dirname, path.join('src', frontendDirectory, 'src')),
    },
    fallback: {
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      assert: require.resolve('assert/'),
      stream: require.resolve('stream-browserify/'),
      util: require.resolve('util/'),
      //add
      crypto: require.resolve('crypto-browserify'),
      url: false,
      zlib: false,
      http: false,
      https: false,
    },
  },
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist', frontendDirectory),
  },

  // Depending in the language or framework you are using for
  // front-end development, add module loaders to the default
  // webpack configuration. For example, if you are using React
  // modules and CSS as described in the "Adding a stylesheet"
  // tutorial, uncomment the following lines:
  module: {
    rules: [
      {
        test: /\.(ttf|woff|woff2?)$/i,
        type: 'asset/resource',
        generator: { filename: 'static/iconfont/[hash:10][ext][query]' },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 1 * 1024 } },
        generator: { filename: 'static/images/[hash:10][ext][query]' },
      },
      {
        test: /\.(ts|tsx|jsx)$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: isDevelopment,
        },
      },
      { test: /\.css$/, use: ['vue-style-loader', 'css-loader'] },
      { test: /\.vue$/, use: ['vue-loader'] },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, path.join('src', frontendDirectory, 'public', 'index.html')),
      cache: false,
    }),
    new webpack.EnvironmentPlugin([
      ...Object.keys(process.env).filter((key) => {
        if (key.includes('CANISTER')) return true;
        if (key.includes('DFX')) return true;
        return false;
      }),
    ]),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve('buffer/'), 'Buffer'],
      process: require.resolve('process/browser'),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: `src/${frontendDirectory}/public`,
          noErrorOnMissing: true,
          filter: (resourcePath) => {
            return resourcePath.indexOf('index.html') === -1;
          },
        },
      ],
    }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __PUBLIC_PATH__: JSON.stringify(''),
    }),
  ],
  // proxy /api to port 4943 during development.
  // if you edit dfx.json to define a project-specific local network, change the port to match.
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
    static: path.resolve(__dirname, 'src', frontendDirectory, 'assets'),
    hot: true,
    watchFiles: [path.resolve(__dirname, 'src', frontendDirectory)],
    liveReload: true,
  },
};
