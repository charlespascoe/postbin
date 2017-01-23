const babel = require('gulp-babel'),
      gulp = require('gulp'),
      nodemon = require('gulp-nodemon'),
      rename = require('gulp-rename'),
      rimraf = require('rimraf'),
      sourcemaps = require('gulp-sourcemaps');


const outDir = './.compiled-server/server';

gulp.task('clean', function (cb) {
  rimraf('./.compiled-server', cb);
});

gulp.task('build', ['clean'], function () {
  return gulp.src('./src/server/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({plugins: ['transform-async-to-generator', 'transform-es2015-modules-commonjs']}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outDir));
});

gulp.task('build-dev', ['build'], function () {
  return gulp.src('./config/development.json')
    .pipe(rename('configuration.json'))
    .pipe(gulp.dest(outDir));
});

gulp.task('start', ['build-dev'], function () {
  return nodemon({
    script: `${outDir}/index.js`,
    watch: 'src/**/*.*',
    ignore: ['**/*.swp', '.compiled-server/**/*'],
    tasks: ['build-dev']
  });
});
