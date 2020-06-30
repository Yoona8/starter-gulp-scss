'use strict';

const gulp = require('gulp');
const { src, dest, series } = require('gulp');
const sass = require('gulp-sass');
const concatCss = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const mincss = require('gulp-csso');
const rename = require('gulp-rename');
const del = require('del');
const server = require('browser-sync').create();

const paths = {
    src: 'src/',
    scssEntry: 'src/styles/style.scss',
    scssSrc: 'src/styles/**/*.scss',
    cssEntry: 'src/styles/style.css',
    cssSrc: 'src/styles/**/*.css',
    htmlSrc: 'src/*.html',
    jsSrc: 'src/scripts/*.js',
    assetsSrc: 'src/assets/**/*.*',
    buildDest: 'build/',
};

function clean(done) {
    del(paths.buildDest);
    done();
}

function buildScss() {
    return src(paths.scssEntry)
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass())
        .pipe(mincss())
        .pipe(rename('style.min.css'))
        .pipe(sourcemap.write('.'))
        .pipe(dest(paths.buildDest))
        .pipe(server.stream());
}

function buildCss() {
    return src(paths.cssEntry)
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(concatCss(paths.buildDest + 'style.css'))
        .pipe(mincss())
        .pipe(rename('style.min.css'))
        .pipe(sourcemap.write('.'))
        .pipe(dest(paths.buildDest))
        .pipe(server.stream());
}

function html() {
    return src(paths.htmlSrc)
        .pipe(dest(paths.buildDest));
}

function js() {
    return src(paths.jsSrc, {
        base: paths.src
    })
        .pipe(dest(paths.buildDest));
}

function reloadServer(done) {
    server.reload();
    done();
}

function copy() {
    return src(paths.assetsSrc, {
        base: paths.src
    })
        .pipe(dest(paths.buildDest));
}

function runServer() {
    server.init({
        server: paths.buildDest
    });

    // gulp.watch(paths.scssSrc, series(buildScss));
    gulp.watch(paths.cssSrc, series(buildCss));
    gulp.watch(paths.htmlSrc, series(html, reloadServer));
    gulp.watch(paths.jsSrc, series(js, reloadServer));
}

exports.clean = clean;
// exports.build = series(buildScss, html, js, copy);
exports.build = series(buildCss, html, js, copy);
// exports.dev = series(buildScss, html, js, copy, runServer);
exports.dev = series(buildCss, html, js, copy, runServer);
