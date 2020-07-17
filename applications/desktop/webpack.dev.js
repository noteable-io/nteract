const webpack = require("webpack");
const { merge } = require("webpack-merge");

const { commonMainConfig, commonRendererConfig } = require("./webpack.common");

const rendererConfig = merge.merge(commonRendererConfig, {
  devtool: false, // Turn off webpack's default source maps, as they generate
  plugins: [      // conflicting information with the plugin.
    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
});

module.exports = [commonMainConfig, rendererConfig];
