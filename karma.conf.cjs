const path = require('path');
const webpack = require('webpack');

// Asegurar ruta de Chrome en entornos Linux/Debian/Ubuntu
if (!process.env.CHROME_BIN) {
  const fs = require('fs');
  const possiblePaths = [
    '/opt/google/chrome/chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      process.env.CHROME_BIN = p;
      break;
    }
  }
}

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],

    files: [
      { pattern: 'tests/**/*.spec.jsx', watched: false }
    ],

    preprocessors: {
      'tests/**/*.spec.jsx': ['webpack']
    },

    webpack: {
      mode: 'development',
      plugins: [
        new webpack.DefinePlugin({
          'import.meta.env': JSON.stringify({
            VITE_API_USUARIOS_URL: 'http://api.test/usuarios/api',
            VITE_API_CATEGORIAS_URL: 'http://api.test/categorias/api/categories',
            VITE_API_PRODUCTOS_URL: 'http://api.test/productos/api/products',
            VITE_API_VENTAS_URL: 'http://api.test/ventas/api/orders',
            VITE_API_REPORTES_URL: 'http://api.test/reportes/api/reports'
          })
        })
      ],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: { node: 'current' } }],
                  ['@babel/preset-react', { runtime: 'automatic' }]
                ],
                plugins: [
                  ['babel-plugin-istanbul', {
                    include: ['src/**/*.{js,jsx}'],
                    exclude: ['tests/**', 'src/main.jsx']
                  }]
                ]
              }
            }
          },
          {
            test: /\.css$/,
            type: 'asset/source'
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    },

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },

    specReporter: {
      maxLogLines: 5,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: false,
      suppressSkipped: true,
      showSpecTiming: true
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,

    browsers: ['ChromeHeadlessNoSandbox'],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222'
        ]
      }
    },

    client: {
      jasmine: {
        random: false
      }
    },

    singleRun: true,
    concurrency: Infinity
  });
};
