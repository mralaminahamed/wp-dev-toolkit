const path = require('path');

const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  devtool: 'source-map',
  entry: {
    index: path.resolve(process.cwd(), 'src', 'index.tsx'),
  },
  output: {
    ...defaultConfig.output,
    path: path.resolve(process.cwd(), 'build'),
  },
  resolve: {
    ...defaultConfig.resolve,
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      ...defaultConfig.resolve.alias,
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  module: {
    ...defaultConfig.module,
    rules: [
      ...defaultConfig.module.rules,
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
};
