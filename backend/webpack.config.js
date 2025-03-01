const path = require("path");

module.exports = {
  entry: "./server.ts", // Punto de entrada principal
  mode: "development",
  target: "node", // Importante para aplicaciones backend
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  stats: "errors-only", // Para evitar mensajes innecesarios
  target: 'node'
};