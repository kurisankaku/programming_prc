module.exports = {
  entry: {
    bundle: './app/scripts/app.js',
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
};
