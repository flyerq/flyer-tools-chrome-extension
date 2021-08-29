const {
  override,
  useEslintRc,
  overrideDevServer,
  addWebpackPlugin,
  disableChunk,
  fixBabelImports,
} = require('customize-cra');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const multipleEntry = require('react-app-rewire-multiple-entry')([
  {
    entry: 'src/popup/index.js',
    template: 'public/popup.html',
    outPath: '/popup.html',
  },
  {
    entry: 'src/options/index.js',
    template: 'public/options.html',
    outPath: '/options.html',
  },
]);

const devServerConfig = () => config => {
  return {
    ...config,
    writeToDisk: true,
  };
};

const copyPlugin = new CopyPlugin({
  patterns: [
    { from: 'public', to: '' },
    // { from: 'src/background.js', to: '' },
    // { from: 'src/content.js', to: '' },
  ],
});

module.exports = {
  webpack: override(
    disableChunk(),
    useEslintRc('./.eslintrc'),
    addWebpackPlugin(copyPlugin),
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css',
    }),
    multipleEntry.addMultiEntry,
    (config) => {
      Object.assign(config.entry, {
        content: path.resolve(__dirname, './src/content.js'),
        background: path.resolve(__dirname, './src/background.js'),
      });

      const filename = config.output.filename.replace(/\.\[contenthash:8\]/i, '').replace(/\.bundle\.js/i, '.js');
      const rootFiles = ['content', 'background'];
      Object.assign(config.output, {
        filename: (chunkData) => rootFiles.includes(chunkData.chunk.name) ? '[name].js' : filename,
        chunkFilename: config.output.chunkFilename.replace(/\.\[contenthash:8\]/i, ''),
      });

      return config;
    },
  ),
  devServer: overrideDevServer(devServerConfig()),
};
