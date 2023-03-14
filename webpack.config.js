const path = require('path');
const { UserscriptPlugin } = require('webpack-userscript');

var config = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'production',
  optimization: {
    minimize: false,
  },
  output: {
    filename: 'steam-hunters-assistant.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new UserscriptPlugin({
      headers: {
        name: 'Steam Hunters Assistant',
        match: [
          'https://steamhunters.com/*',
          'https://store.steampowered.com/*',
        ],
        connect: [
          'steamhunters.com',
          'store.steampowered.com',
        ],
        grant: [
          'GM.getValue',
          'GM.setValue',
          'GM.xmlHttpRequest',
        ],
        icon: 'https://steamhunters.com/content/img/steam_hunters.svg',
        namespace: 'https://github.com/RudeySH/steam-hunters-assistant',
      },
      downloadBaseUrl: 'https://raw.githubusercontent.com/RudeySH/steam-hunters-assistant/main/dist/',
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
    config.output.path = path.resolve(__dirname, 'dist', 'development');
    config.watch = true;
  }

  return config;
};
