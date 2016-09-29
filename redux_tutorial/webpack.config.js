module.exports = {
  devtool: 'inline-source-map',
  entry: {
    bundle: './app/scripts/index.jsx',
  },
  output: {
    path: `${__dirname}/app/dist`,
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
