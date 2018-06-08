'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');

// Compile SCSS
gulp.task('css:compile', function() {
  return gulp
    .src('./public/scss/*.scss')
    .pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

// links browserSync with node server
gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:8080',
    files: ['public/**/*.*', 'views/**/*.*'],
    browser: 'chrome',
    notify: false,
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

// default gulp task. compiles scss to css on any change
gulp.task('default', ['browser-sync'], function() {
  gulp.watch('./public/scss/*.scss', ['css:compile']);
});
