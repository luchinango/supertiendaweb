const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './server.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // ✅ Compila sin verificar tipos (rápido)
              compilerOptions: {
                noEmit: false, // ✅ Anula "noEmit" solo para Webpack
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};