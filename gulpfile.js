'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const gulpSass = require('gulp-sass');
const dartSass = require('sass');
const sass = gulpSass(dartSass);
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const pump = require('pump');
const babel = require('gulp-babel');

// Compile SCSS
gulp.task('css:compile', function () {
	return gulp
		.src('./public/scss/*.scss')
		.pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(gulp.dest('./public/css'));
});

// minify css
gulp.task(
	'css:min',
	gulp.series('css:compile', function () {
		return gulp
			.src('./public/css/style.css')
			.pipe(cleanCSS())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest('./public/css'));
	})
);

// minifies js files
gulp.task('js', function (cb) {
	pump(
		[
			gulp.src('./public/js/app.js'),
			babel({ presets: ['env'] }),
			uglify(),
			rename({ suffix: '.min' }),
			gulp.dest('./public/js'),
		],
		cb
	);
});

// restarts the server with nodemon
gulp.task('nodemon', function (cb) {
	var started = false;
	return nodemon({ script: 'server.js' }).on('start', function () {
		if (!started) {
			cb();
			started = true;
		}
	});
});

// links browserSync with node server
gulp.task(
	'browser-sync',
	gulp.series('nodemon', function () {
		browserSync.init(null, {
			proxy: 'http://localhost:8080',
			files: ['public/**/*.*', 'views/**/*.*'],
			browser: 'chrome',
			notify: false,
			port: 8000,
		});
	})
);

// get Bootstrap files
gulp.task('getbs', function () {
	return gulp
		.src([
			'./node_modules/bootstrap/dist/**/*',
			'!./node_modules/bootstrap/dist/css/bootstrap-grid*',
			'!./node_modules/bootstrap/dist/css/bootstrap-reboot*',
		])
		.pipe(gulp.dest('./public/vendor/bootstrap'));
});

// get jQuery files
gulp.task(
	'getjq',
	gulp.series('getbs', function () {
		return gulp
			.src(['./node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js'])
			.pipe(gulp.dest('./public/vendor/jquery'));
	})
);

// move bootstrap and jquery to public
gulp.task(
	'move',
	gulp.series('getbs', 'getjq', function (done) {
		return gulp.parallel(
			function () {
				return gulp
					.src(['./public/vendor/bootstrap/css/bootstrap.min.css'])
					.pipe(gulp.dest('./public/css'));
			},
			function () {
				return gulp
					.src(['./public/vendor/bootstrap/js/bootstrap.bundle.min.js'])
					.pipe(gulp.dest('./public/js'));
			},
			function () {
				return gulp.src(['./public/vendor/jquery/jquery.min.js']).pipe(gulp.dest('./public/js'));
			}
		)(done);
	})
);

// compiles scss to css, and minifies css
gulp.task('css', gulp.series('css:compile', 'css:min'));

// gets bootsrtap, and jquery files from node_modules, and places them in the css and js folders in public
gulp.task('getfiles', gulp.series('move'));

// default gulp task. watches js and scss files for changes
gulp.task('default', gulp.series('browser-sync'), function () {
	gulp.watch('./public/scss/*.scss', ['css']);
	gulp.watch('./public/js/*', ['js']);
});
