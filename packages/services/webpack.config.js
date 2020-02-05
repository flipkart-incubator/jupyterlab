var version = require('./package.json').version;

module.exports = {
  entry: './lib',
  output: {
    filename: './dist/index.js',
    library: '@fk-jupyterlab/services',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath:
      'https://unpkg.com/@fk-jupyterlab/services@' + version + '/dist/'
  },
  bail: true,
  devtool: 'source-map'
};
