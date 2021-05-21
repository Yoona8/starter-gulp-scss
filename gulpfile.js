'use strict';

const gulp = require('gulp');
const {src, dest, series} = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mincss = require('gulp-csso');
const rename = require('gulp-rename');
const del = require('del');
const server = require('browser-sync').create();

const paths = {
  src: 'src/',
  scssEntry: 'src/styles/style.scss',
  scssSrc: 'src/styles/**/*.scss',
  htmlSrc: 'src/*.html',
  jsSrc: 'src/scripts/*.js',
  assetsSrc: 'src/assets/**/*.*',
  buildDest: 'build/',
};

const clean = (done) => {
  del(paths.buildDest);
  done();
}

const scss = () => {
  return src(paths.scssEntry)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(mincss())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(dest(paths.buildDest))
    .pipe(server.stream());
}

const html = () => {
  return src(paths.htmlSrc)
    .pipe(dest(paths.buildDest))
    .pipe(server.stream());
}

const js = () => {
  return src(paths.jsSrc)
    .pipe(dest(paths.buildDest))
    .pipe(server.stream());
}

const copy = () => {
  return src(paths.assetsSrc, {
    base: paths.src
  })
    .pipe(dest(paths.buildDest));
}

const serve = (done) => {
  server.init({
    server: paths.buildDest
  });

  done();
}

const watch = () => {
  gulp.watch(paths.scssSrc, series(scss));
  gulp.watch(paths.htmlSrc, series(html));
  gulp.watch(paths.jsSrc, series(js));
}

exports.clean = clean;
exports.build = series(scss, html, js, copy);
exports.dev = series(scss, html, js, copy, serve, watch);
