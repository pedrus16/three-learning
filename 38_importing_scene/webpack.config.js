const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  devServer: {
    static: "./dist",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/index.html"),
      minify: true,
    }),
    new MiniCSSExtractPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/assets/models"),
          to: path.resolve(__dirname, "dist/assets/models"),
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules/three/examples/js/libs/draco"
          ),
          to: path.resolve(__dirname, "dist/libs/draco"),
        },
      ],
    }),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      // Typescript
      {
        test: /\.m?(js|ts)$/,
        exclude: /(node_modules)/,
        use: {
          // `.swcrc` can be used to configure swc
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
              },
            },
          },
        },
      },
      // CSS
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[hash][ext]",
        },
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[hash][ext]",
        },
      },
      // GLTF
      {
        test: /\.(gltf|glb|bin)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/gltf/[hash][ext]",
        },
      },
      {
        resourceQuery: /resource/,
        type: "asset/resource",
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
};
