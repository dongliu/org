module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: ['gruntfile.js', 'lib/**/*.js', 'routes/**/*.js', 'public/javascripts/*.js', 'test/**/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    shell: {
      options: {
        stderr: false
      },
      puglint: {
        command: './node_modules/pug-lint/bin/pug-lint ./views/*.pug ./views/client-side/*.pug'
      }
    }
  });

  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('puglint', ['shell:puglint']);
  grunt.registerTask('default', ['puglint', 'eslint']);
};
