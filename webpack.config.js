const defaults = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isLegacy = process.env.BUILD_TARGET === "legacy";


module.exports = isLegacy
  ? {
      // --- LEGACY CONFIGURATION ---
      entry: {
        admin: "./src/admin.tsx",
        settings: "./src/settings.tsx",
      },
      output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name]-legacy.js",
        clean: false,
      },
      devtool: false,
      resolve: {
        ...defaults.resolve,
        extensions: [".tsx", ".ts", ".js", ".jsx"],
      },
      module: {
        rules: [
          {
            // --- THIS IS THE FIX ---
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            // Explicitly use babel-loader with the correct WordPress preset.
            // This is the most stable way to ensure TS/JSX are handled correctly.
            use: {
              loader: "babel-loader",
              options: {
                presets: [require.resolve("@wordpress/babel-preset-default")],
              },
            },
          },
          {
            test: /\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              "css-loader",
              "postcss-loader",
              "sass-loader",
            ],
          },
          {
            test: /\.svg$/,
            type: "asset/resource",
            generator: {
              filename: "images/[name][ext]",
            },
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
        }),
      ],
    }
  : {
      // --- MODERN (!isLegacy) CONFIGURATION (Working) ---
      ...defaults,
      externals: {
        react: "React",
        "react-dom": "ReactDOM",
      },
      entry: {
        admin: "./src/admin.tsx",
        settings: "./src/settings.tsx",
        // Gutenberg blocks. Overriding `entry` defeats wp-scripts' automatic
        // block.json discovery, so each block is listed explicitly. The
        // block.json files themselves still get copied to build/ by the
        // CopyPlugin already present in defaults.plugins (pattern
        // "**/block.json", context "src").
        "blocks/video/index": "./src/blocks/video/index.tsx",
        "blocks/video-button/index": "./src/blocks/video-button/index.tsx",
        // Inline formats are not blocks: they have no block.json and are
        // enqueued on enqueue_block_editor_assets, so they must be listed here
        // explicitly like the blocks above.
        "formats/video-link/index": "./src/formats/video-link/index.tsx",
      },
      output: {
        ...defaults.output,
        filename: "[name].js",
        clean: false,
      },
    };
