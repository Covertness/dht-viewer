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
    },
    'gh-pages': {
      options: {
        base: '.'
      },
      src: ['lib/**', 'github.gif', 'index.html']
    }
  });

  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('default', ['bower-install-simple', 'curl']);

};