const path = require('path');
const WebpackUserscript = require('webpack-userscript');

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
    filename: 'steam-hunters-assistant.user.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new WebpackUserscript({
      headers: {
        name: 'Steam Hunters Assistant',
        match: [
          'https://store.steampowered.com/app/*',
        ],
        namespace: 'https://github.com/RudeySH/steam-hunters-assistant',
        grant: 'GM.xmlHttpRequest',
        connect: [
          'steamhunters.com',
        ],
      },
      downloadBaseUrl: 'https://github.com/RudeySH/steam-hunters-assistant/raw/main/dist/',
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
