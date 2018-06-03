'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

// links browserSync with node server
gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:8080',
    files: ['public/**/*.*', 'views/**/*.*'],
    browser: 'chrome',
    port: 8000
  });
});

// restarts the server with nodemon
gulp.task('nodemon', function(cb) {
  var started = false;
  return nodemon({
    script: 'server.js'
  }).on('start', function() {
    if (!started) {
      cb();
      started = true;
    }
  });
});

// default gulp task
gulp.task('default', ['browser-sync']);
