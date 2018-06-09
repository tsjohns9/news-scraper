'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var pump = require('pump');
var babel = require('gulp-babel');

// Compile SCSS
gulp.task('css:compile', function() {
  return gulp
    .src('./public/scss/*.scss')
    .pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

// minify css
gulp.task('css:min', ['css:compile'], function() {
  return gulp
    .src('./public/css/style.css')
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./public/css'));
});

// minifies js files
gulp.task('js', function(cb) {
  pump(
    [
      gulp.src('./public/js/app.js'),
      babel({ presets: ['env'] }),
      uglify(),
      rename({ suffix: '.min' }),
      gulp.dest('./public/js')
    ],
    cb
  );
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

// get Bootstrap files
gulp.task('getbs', function() {
  return gulp
    .src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./public/vendor/bootstrap'));
});

// get jQuery files
gulp.task('getjq', ['getbs'], function() {
  return gulp
    .src(['./node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js'])
    .pipe(gulp.dest('./public/vendor/jquery'));
});

// move bootstrap and jquery to public
gulp.task('move', ['getbs', 'getjq'], function() {
  gulp.src(['./public/vendor/bootstrap/css/bootstrap.min.css']).pipe(gulp.dest('./public/css'));
  gulp.src(['./public/vendor/bootstrap/js/bootstrap.bundle.min.js']).pipe(gulp.dest('./public/js'));
  gulp.src(['./public/vendor/jquery/jquery.min.js']).pipe(gulp.dest('./public/js'));
});

// compiles scss to css, and minifies css
gulp.task('css', ['css:compile', 'css:min']);

// gets bootsrtap, and jquery files from node_modules, and places them in the css and js folders in public
gulp.task('getfiles', ['getbs', 'getjq', 'move']);

// default gulp task. watches js and scss files for changes
gulp.task('default', ['browser-sync'], function() {
  gulp.watch('./public/scss/*.scss', ['css']);
  gulp.watch('./public/js/*', ['js']);
});
