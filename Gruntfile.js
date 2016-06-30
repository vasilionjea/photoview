// https://npmjs.org/package/grunt-contrib 
module.exports = function(grunt) {  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>.\n' +
        ' * Licensed under the <%= pkg.license.name %> license.\n */ '
    },


    /**
     * Concat
     */
    concat: {
      options: {},

      scripts: {
        src: [
          'src/js/utils.js',
          'src/js/http.js',
          'src/js/flickr.js',
          'src/js/photoview.js'
        ],

        dest: 'js/<%= pkg.name %>.js'
      }
    },


    /**
     * Sass (SCSS syntax)
     */
    sass: {
      options: {
        sourcemap: true,
        style: 'compressed'
      },

      dist: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['*.scss'],
          dest: './css',
          ext: '.css'
        }]
      }
    },


    /**
     * JSHint
     */
    jshint: {
      options: {
        // Report JSHint errors but not fail the task
        force: true,

        // Ignore warnings
        '-W030': true, // `e && e.preventDefault()`

        globals: {
          window: true,
          document: true,
          XMLHttpRequest: true
        },

        // Enforcing
        'camelcase': false,    // Identifiers must be in camelCase
        'curly'    : true,     // Require {} for every new block or scope
        'eqeqeq'   : true,     // Require triple equals (===) for comparison
        'forin'    : true,     // Require filtering for..in loops with obj.hasOwnProperty()
        'immed'    : true,     // Require immediate invocations to be wrapped in parens e.g. `(function () { } ());`
        'indent'   : 2,        // Number of spaces to use for indentation
        'latedef'  : false,    // Require variables/functions to be defined before being used
        'newcap'   : true,     // Require capitalization of all constructor functions e.g. `new F()`
        'noempty'  : true,     // Prohibit use of empty blocks
        'plusplus' : true,     // Prohibit use of `++` & `--`
        'quotmark' : 'single', // Require single quotes
        'undef'    : true,     // Require all non-global variables to be declared (prevents global leaks)
        'unused'   : false,    // Require all defined variables be used
        'strict'   : true,     // Requires all functions run in ES5 Strict Mode
        'maxparams': 3,        // Max number of formal params allowed per function
        'maxlen'   : 160,      // Max number of characters per line

        // Relaxing
        'debug'    : true,     // Allow debugger statements e.g. browser breakpoints.
      },

      src: ['js/<%= pkg.name %>.js']
    },


    /** 
     * UglifyJS
     */
    uglify: {
      options: {
        banner: '<%= meta.banner %>',
        report: 'gzip',
        compress: true,
        drop_console: true
      },

      dist: {
        files: {
          'js/<%= pkg.name %>.min.js': ['js/<%= pkg.name %>.js']
        }
      }
    },


    /**
     * Watch
     * Run `grunt watch` to watch files
     */
    watch: {
      sass: {
        files: ['src/css/*.scss'],
        tasks: ['sass'],
        options: { spawn: false }
      },

      scripts: {
        files: ['src/js/*.js'],
        tasks: ['concat', 'uglify', 'jshint'],
        options: { spawn: false }
      }
    },

    /**
     * Static Server
     */
    connect: {
      dev: {
        options: {
          port: 9000,
          keepalive: true
        }
      }
    }
  });


  /**
   * Load the Grunt plugins
   */
  [
    'grunt-contrib-concat',
    'grunt-contrib-sass',
    'grunt-contrib-uglify', 
    'grunt-contrib-jshint',
    'grunt-contrib-watch',
    'grunt-contrib-connect'
  ].forEach(grunt.loadNpmTasks);

  // The default task
  grunt.registerTask('default', ['watch']);
};
