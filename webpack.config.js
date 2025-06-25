const path = require('path');

const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  devtool: 'source-map',
  entry: {
    index: path.resolve(process.cwd(), 'src/index.tsx'),
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
  }
};
