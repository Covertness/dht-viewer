module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'bower-install-simple': {
      options: {
        directory: 'lib'
      },
      'dev': {
        options: {
          production: false
        }
      }
    },
    curl: {
      'lib/collections.min.js': 'https://raw.githubusercontent.com/montagejs/collections/master/collections.min.js',
    },
    'http-server': {
      'dev': {
        root: '.',
        port: 8282,
        host: "127.0.0.1",
        openBrowser: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('default', ['bower-install-simple', 'curl']);

};