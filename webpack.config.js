const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, args) => {
  const isDevelopment = args.mode !== 'production';
  return {
    devtool: isDevelopment ? 'inline-source-map' : undefined,
    mode: args.mode,
    entry: {
      app: [path.resolve(__dirname, 'src/index.tsx')],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
      }),
      new CleanWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      publicPath: '/',
    },
    devServer: {
      static: path.join(__dirname, 'public'),
      compress: true,
      port: 3000,
    },
  };
};
