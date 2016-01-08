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
    'requirejs': {
      compile: {
        options: {
          baseUrl: "lib",
          paths: {
            "heatmap": "heatmap.js-amd/build/heatmap",
            "collections": "collections.min",
            "spin": "spin.js/spin.min",
            "clipboard": "clipboard/dist/clipboard.min",
            "jquery": "jquery/dist/jquery.min"
          },
          name: "../main",
          out: "publish/main.js"
        }
      }
    },
    'copy': {
      main: {
        files: [
          {src: ['lib/requirejs/require.js'], dest: 'publish/'},
          {src: ['github.gif'], dest: 'publish/'},
          {src: ['index.html'], dest: 'publish/'}
        ],
      },
    },
    'gh-pages': {
      options: {
        base: 'publish'
      },
      src: ['**']
    }
  });

  grunt.loadNpmTasks('grunt-bower-install-simple');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('default', ['bower-install-simple', 'curl']);
  grunt.registerTask('publish', ['requirejs', 'copy', 'gh-pages']);
};