require("dotenv").config();
const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = (env, args) => {
  const publicUrl = process.env.PUBLIC_URL || "";
  const publicPath = process.env.PUBLIC_PATH || "";
  const isDevelopment = args.mode !== "production";

  return {
    devtool: isDevelopment ? "inline-source-map" : undefined,
    mode: args.mode,
    entry: {
      app: [path.resolve(__dirname, "src/index.tsx")],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      plugins: [new TsconfigPathsPlugin()],
    },
    optimization: !isDevelopment
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              extractComments: false,
              parallel: true,
              terserOptions: {
                format: {
                  comments: false,
                },
              },
            }),
          ],
          splitChunks: {
            chunks: "all",
          },
        }
      : {},
    plugins: [
      new webpack.EnvironmentPlugin(
        Object.keys(process.env).reduce(
          (acc, key) => {
            if (key.startsWith("REACT_")) acc[key] = process.env[key];
            return acc;
          },
          {
            NODE_ENV: args.mode,
            PUBLIC_PATH: publicPath,
            PUBLIC_URL: publicUrl,
          }
        )
      ),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "**/*",
            context: "public/",
            globOptions: {
              ignore: ["**/*/index.html"],
            },
          },
        ],
        options: {
          concurrency: 100,
        },
      }),
      new CleanWebpackPlugin(),
      ...(isDevelopment
        ? []
        : [
            new MiniCssExtractPlugin({ filename: "[name].css" }),
            new WorkboxPlugin.GenerateSW({
              clientsClaim: true,
              skipWaiting: true,
            }),
          ]),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.(svg|webp|png|jpeg|gif|bmp|jpg|ttf|eot|woff2|woff)$/i,
          exclude: /node_modules/,
          use: ["file-loader"],
        },
        {
          test: /\.(sass|scss|css)$/,
          use: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  mode: "local",
                  auto: true,
                  localIdentName: "[path][name]__[local]--[hash:base64:5]",
                  localIdentContext: path.resolve(__dirname, "src"),
                },
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [require("autoprefixer")()],
                },
              },
            },
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [path.resolve(__dirname, "src")],
                },
                additionalData: '@import "variables";',
              },
            },
          ],
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      chunkFilename: "[name].chunk.js",
      publicPath: publicPath,
    },
    devServer: {
      static: path.join(__dirname, "public"),
      compress: true,
      port: 3000,
    },
  };
};
