const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  entry: {
    index: path.resolve(process.cwd(), 'src', 'index.tsx'),
    // Add more entry points as needed
  },
  output: {
    ...defaultConfig.output,
    path: path.resolve(process.cwd(), 'build'),
  },
  resolve: {
    ...defaultConfig.resolve,
    extensions: ['.ts', '.tsx'],
  },
  module: {
    ...defaultConfig.module,
    rules: [
      ...defaultConfig.module.rules,
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    ...defaultConfig.plugins,
    // Add any additional plugins here
  ],
};