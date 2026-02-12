const { src, dest, watch, parallel, series } = require('gulp');

const del = require("del");
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const gap = require('gulp-append-prepend');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const fs = require('fs');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const imagemin = require('gulp-imagemin');
const htmlbeautify = require('gulp-html-beautify');

let outputDir = 'release';

var options = {
	indentSize: 1,
}

// ===================== DIR SWITCH =====================
function setDevDir(done) {
	outputDir = 'release';
	done();
}

function setBuildDir(done) {
	outputDir = 'build';
	done();
}

function reset() {
	return del('./release');
}

function resetBuild() {
	return del('./build');
}

exports.reset = reset;
exports.resetBuild = resetBuild;

// ===================== STYLES =====================
function styleConcat() {
	return src([
		'dev/style/scss/common.scss',
		'dev/components/elements/**/*.scss',
		'dev/components/**/**/*.scss',
	])
		.pipe(scss())
		.pipe(autoprefixer({ grid: true, overrideBrowserslist: ["last 10 versions"], cascade: true }))
		.pipe(concat('all-style.css'))
		.pipe(groupCssMediaQueries())
		.pipe(replace(/[^-_"'][(./)\w]*\/images/g, '../images'))
		.pipe(dest(`${outputDir}/css`))
		.pipe(browserSync.stream())
}
exports.styleConcat = styleConcat;

function styleConcatCommon() {
	return src([
		'dev/style/scss/common.scss',
		'dev/components/header/*.scss',
		'dev/components/footer/*.scss',
	])
		.pipe(scss())
		.pipe(autoprefixer({ grid: true, overrideBrowserslist: ["last 10 versions"], cascade: true }))
		.pipe(concat('common.css'))
		.pipe(groupCssMediaQueries())
		.pipe(replace(/[^-_"'][(./)\w]*\/images/g, '../images'))
		.pipe(dest(`${outputDir}/css`))
		.pipe(browserSync.stream())
}
exports.styleConcatCommon = styleConcatCommon;

function scss2cssComponent() {
	return src(['dev/components/**/*.scss', '!dev/components/{header,footer}/*.scss'])
		.pipe(scss())
		.pipe(autoprefixer({ grid: true, overrideBrowserslist: ["last 10 versions"], cascade: true }))
		.pipe(replace(/[./A-Z0-9]*\/images/g, '../images'))
		.pipe(dest(`${outputDir}/components/`))
		.pipe(browserSync.stream())
}
exports.scss2cssComponent = scss2cssComponent;

function scss2cssMain() {
	return src(['dev/style/scss/*[!common].scss'])
		.pipe(scss())
		.pipe(autoprefixer({ grid: true, overrideBrowserslist: ["last 10 versions"], cascade: true }))
		.pipe(replace(/[./A-Z0-9]*\/images/g, '../images'))
		.pipe(groupCssMediaQueries())
		.pipe(dest(`${outputDir}/css`))
		.pipe(browserSync.stream())
}
exports.scss2cssMain = scss2cssMain;

function cssCopy() {
	return src('dev/style/**/*.css')
		.pipe(dest(`${outputDir}/css`))
		.pipe(browserSync.stream())
}
exports.cssCopy = cssCopy;

// ===================== JS =====================
function scriptsConcat() {
	return src([
		'dev/js/*.js',
		'dev/components/elements/*.js',
		'dev/components/**/*.js',
	])
		.pipe(concat('all-scripts.js'))
		.pipe(gap.prependText("$(document).ready(function () {"))
		.pipe(gap.appendText('});'))
		.pipe(dest(`${outputDir}/js`))
		.pipe(browserSync.stream())
}
exports.scriptsConcat = scriptsConcat;

function scriptsConcatCommon() {
	return src([
		'dev/js/common.js',
		'dev/components/header/*.js',
		'dev/components/footer/*.js',
	])
		.pipe(concat('common.js'))
		.pipe(gap.prependText("$(document).ready(function () {"))
		.pipe(gap.appendText('});'))
		.pipe(dest(`${outputDir}/js`))
		.pipe(browserSync.stream())
}
exports.scriptsConcatCommon = scriptsConcatCommon;

function scriptsCopy() {
	return src(['dev/js/**/*[!common, all-scripts].js'])
		.pipe(gap.prependText("$(document).ready(function () {"))
		.pipe(gap.appendText('});'))
		.pipe(dest(`${outputDir}/js`))
		.pipe(browserSync.stream())
}
exports.scriptsCopy = scriptsCopy;

function scriptsComponent() {
	return src(['dev/components/**/*.js', '!dev/components/{header,footer}/*.js'])
		.pipe(dest(`${outputDir}/components/`))
		.pipe(browserSync.stream())
}
exports.scriptsComponent = scriptsComponent;

// ===================== SERVER =====================
function browserSyncFunction() {
	browserSync.init({
		server: {
			baseDir: `${outputDir}/`
		},
	})
}
exports.browserSyncFunction = browserSyncFunction;

// ===================== HTML =====================
function building() {
	return src(['dev/**/*.html'])
		.pipe(replace(/[./A-Z0-9]*\/images/g, 'images'))
		.pipe(dest(`${outputDir}`))
}

function fileincludeDev() {
	return src(['dev/*.html'])
		.pipe(fileinclude())
		.pipe(replace(/[./A-Z0-9]*\/images/g, 'images'))
		.pipe(dest(`${outputDir}/`));
}
exports.fileincludeDev = fileincludeDev;

function fileincludeBuild() {
	return src(['dev/*.html'])
		.pipe(fileinclude())
		.pipe(replace(/[./A-Z0-9]*\/images/g, 'images'))
		.pipe(replace(/[./A-Z0-9]*\/all-style/g, '/common'))
		.pipe(replace(/[./A-Z0-9]*\/all-scripts/g, '/common'))
		.pipe(htmlbeautify(options))
		.pipe(dest(`${outputDir}/`));
}
exports.fileincludeBuild = fileincludeBuild;

// ===================== FILES =====================
function imageCopy() {
	return src(['dev/images/**/*'])
		.pipe(dest(`${outputDir}/images`))
		.pipe(browserSync.stream())
}
exports.imageCopy = imageCopy;

function libraries() {
	return src(['dev/libraries/**/*'])
		.pipe(dest(`${outputDir}/libraries`))
}
exports.libraries = libraries;

function copyfonts() {
	return src(['dev/fonts/*.{woff,woff2}'])
		.pipe(dest(`${outputDir}/fonts`))
}
exports.copyfonts = copyfonts;


// ===================== WATCH =====================
function watching() {
	watch(['dev/style/**/*.scss'], styleConcat, scss2cssMain)
	watch(['dev/components/**/*.scss'], styleConcat)
	watch(['dev/style/**/*.css'], cssCopy)
	watch(['dev/components/**/*.js'], scriptsConcat)
	watch(['dev/js/**/*.js'], scriptsConcat)
	watch(['dev/images/**/*.{jpg,jpeg,png,gif,webp,mp4,svg}'], imageCopy)
	watch(['dev/**/*.html'], fileincludeDev)
	watch(['dev/**/*.html']).on('change', browserSync.reload)
}
exports.watching = watching;


// ===================== TASKS =====================
const mainTasks = series(reset, copyfonts, parallel(scriptsCopy, cssCopy, imageCopy, scss2cssMain, libraries));

const dev = series(
	setDevDir,
	mainTasks,
	fileincludeDev,
	scriptsConcat,
	styleConcat,
	parallel(watching, browserSyncFunction)
);

const build = series(
	setBuildDir,
	resetBuild,
	mainTasks,
	building,
	fileincludeBuild,
	parallel(scriptsComponent, scss2cssComponent, styleConcatCommon, scriptsConcatCommon)
);

exports.default = dev;
exports.build = build;
