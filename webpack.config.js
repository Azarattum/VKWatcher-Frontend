const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.ts",
	mode: "development",
	devtool: "inline-cheap-source-map",
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.pug"
		})
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							transpileOnly: true,
							experimentalWatchApi: true
						}
					}
				],
				include: Path.resolve(__dirname, "./src"),
				exclude: /node_modules/
			},
			{
				test: /\.pug$/,
				use: ["pug-loader"],
				include: Path.resolve(__dirname, "./src"),
				exclude: /node_modules/
			},
			{
				test: /\.scss$/,
				use: ["style-loader", "css-loader", "sass-loader"],
				include: Path.resolve(__dirname, "./src"),
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	output: {
		filename: "bundle.js",
		path: Path.resolve(__dirname, "./dist")
	},
	optimization: {
		splitChunks: {
			chunks: "all",
			minSize: 30000,
			maxSize: 0,
			minChunks: 1,
			maxAsyncRequests: 6,
			maxInitialRequests: 4,
			automaticNameDelimiter: "~",
			automaticNameMaxLength: 30,
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true
				}
			}
		}
	}
};
