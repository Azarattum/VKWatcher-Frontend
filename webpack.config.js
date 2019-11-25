const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.ts",
	mode: "development",
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.pug"
		})
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /(node_modules|\.gir)/
			},
			{
				test: /\.pug$/,
				use: ["pug-loader"],
				exclude: /(node_modules|\.gir)/
			},
			{
				test: /\.scss$/,
				use: ["style-loader", "css-loader", "sass-loader"],
				exclude: /(node_modules|\.gir)/
			}
		]
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	output: {
		filename: "bundle.js",
		path: Path.resolve(__dirname, "./dist")
	}
};
