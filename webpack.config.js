// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    extensions: ['.ts', '.tsx', '.js', '.json'],
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
