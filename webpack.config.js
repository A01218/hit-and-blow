const path = require('path');

module.exports = {
  mode: 'development',
  // The entry point file described above
  entry: './src/index.js',
  // The location of the build folder described above
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js',
  },
  // mojules: {
  //   rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }]
  // },
  module: {
    rules: [{
        test: /\.css/,
        use: ["style-loader", { loader: "css-loader", options: { url: false } }]
    }],
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'eval-source-map',
  target: 'web',
};