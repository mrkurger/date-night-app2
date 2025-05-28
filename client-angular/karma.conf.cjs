module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma.js'),
    ],
    files: [
      { pattern: './src/styles-fixed/*.css', included: true },
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false,
        timeoutInterval: 10000
      },
    },
    coverageReporter: {
      dir: './coverage/client-angular',
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: false,
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: true,
    failOnEmptyTestSuite: false,
    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 40000,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222'
        ]
      }
    },
  });
};
