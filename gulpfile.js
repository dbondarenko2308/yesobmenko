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

var options = {
	indentSize: 1,
}

// удаление папки release и её добавление (для полного обновления файлов)
function reset() {
	return del('./release');
}
exports.reset = reset;

// объединение всех файлов стилей для команды dev
function styleConcat() {
	return src([
		'dev/style/scss/common.scss',
		'dev/components/elements/**/*.scss',
		'dev/components/**/**/*.scss',
	])
		.pipe(scss())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 10 versions"],
			cascade: true,
		}))
		.pipe(concat('all-style.css'))
		.pipe(groupCssMediaQueries())
		.pipe(replace(/[^-_"'][(./)\w]*\/images/g, '../images'))
		.pipe(groupCssMediaQueries())
		.pipe(dest('release/css'))
		.pipe(browserSync.stream())
}
exports.styleConcat = styleConcat;

// объединение общего файла стилей и фалов header и footer для команды build
function styleConcatCommon() {
	return src([
		'dev/style/scss/common.scss',
		'dev/components/header/*.scss',
		'dev/components/footer/*.scss',
	])
		.pipe(scss())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 10 versions"],
			cascade: true,
		}))
		.pipe(concat('common.css'))
		.pipe(groupCssMediaQueries())
		.pipe(replace(/[^-_"'][(./)\w]*\/images/g, '../images'))
		.pipe(groupCssMediaQueries())
		.pipe(dest('release/css'))
		.pipe(browserSync.stream())
}
exports.styleConcatCommon = styleConcatCommon;

// перевод scss в css и копирование файлов стилей компонентов
function scss2cssComponent() {
	return src(['dev/components/**/*.scss', '!dev/components/{header,footer}/*.scss'])
		.pipe(scss())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 10 versions"],
			cascade: true,
		}))
		.pipe(replace(/[./A-Z0-9]*\/images/g, '../images'))
		.pipe(dest('release/components/'))
		.pipe(browserSync.stream())
}
exports.scss2cssComponent = scss2cssComponent;

// перевод scss в css и копирование общих файлов стилей
function scss2cssMain() {
	return src([
		'dev/style/scss/*[!common].scss',
	])
		.pipe(scss())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 10 versions"],
			cascade: true,
		}))
		.pipe(replace(/[./A-Z0-9]*\/images/g, '../images'))
		.pipe(groupCssMediaQueries())
		.pipe(dest('release/css'))
		.pipe(browserSync.stream())
}
exports.scss2cssMain = scss2cssMain;

// копирование файлов стилей 
function cssCopy() {
	return src('dev/style/**/*.css')
		.pipe(dest('release/css'))
		.pipe(browserSync.stream())
}
exports.cssCopy = cssCopy;

// объединение всех файлов стилей для команды dev
function scriptsConcat() {
	return src([
		'dev/js/*.js',
		'dev/components/elements/*.js',
		'dev/components/**/*.js',
	])
		.pipe(concat('all-scripts.js'))
		.pipe(gap.prependText("$(document).ready(function () {"))
		.pipe(gap.appendText('});'))
		.pipe(dest('release/js'))
		.pipe(browserSync.stream())
}
exports.scriptsConcat = scriptsConcat;

// объединение общего файла стилей и фалов header и footer для команды build
function scriptsConcatCommon() {
	return src([
		'dev/js/common.js',
		'dev/components/header/*.js',
		'dev/components/footer/*.js',
	])
		.pipe(concat('common.js'))
		.pipe(gap.prependText("$(document).ready(function () {"))
		.pipe(gap.appendText('});'))
		.pipe(dest('release/js'))
		.pipe(browserSync.stream())
}
exports.scriptsConcatCommon = scriptsConcatCommon;

// копирование файлов js за некоторыми исключениями.
function scriptsCopy() {
	return src([
		'dev/js/**/*[!common, all-scripts].js',
	])
		.pipe(gap.prependText("$(document).ready(function () {"))
		.pipe(gap.appendText('});'))
		.pipe(dest('release/js'))
		.pipe(browserSync.stream())
}
exports.scriptsCopy = scriptsCopy;

// копирование файлов js компонентов за некоторыми исключениями.
function scriptsComponent() {
	return src(['dev/components/**/*.js', '!dev/components/{header,footer}/*.js'])
		.pipe(dest('release/components/'))
		.pipe(browserSync.stream())
}
exports.scriptsComponent = scriptsComponent;

// запуск live server
function browserSyncFunction() {
	browserSync.init({
		server: {
			baseDir: 'release/'
		},
	})
}
exports.browserSyncFunction = browserSyncFunction;

// отслеживание изменений в файлах по следующим путям
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

// копирование файлов компонентов
function building() {
	return src(['dev/**/*.html'])
		.pipe(replace(/[./A-Z0-9]*\/images/g, 'images'))
		.pipe(dest('./release'))
}

// сборка компонентов и замена некоторых записей для команды dev
function fileincludeDev() {
	return src(['dev/*.html'])
		.pipe(fileinclude())
		.pipe(replace(/[./A-Z0-9]*\/images/g, 'images'))
		.pipe(dest('release/'));
}
exports.fileincludeDev = fileincludeDev;

// сборка компонентов и замена некоторых записей для команды build
function fileincludeBuild() {
	return src(['dev/*.html'])
		.pipe(fileinclude())
		.pipe(replace(/[./A-Z0-9]*\/images/g, 'images'))
		.pipe(replace(/[./A-Z0-9]*\/all-style/g, '/common'))
		.pipe(replace(/[./A-Z0-9]*\/all-scripts/g, '/common'))
		.pipe(htmlbeautify(options))
		.pipe(dest('release/'));
}
exports.fileincludeBuild = fileincludeBuild;

// перевод шрифтов в форма ttf и их копирование
const outToTtf = () => {
	// Ищем файлы шрифтов .otf, .eot
	return src(`dev/fonts/*.{eot,otf}`, {})
		// Конвертируем в .ttf
		.pipe(fonter({
			formats: ['ttf']
		}))
		// Выгружаем в исходную папку
		.pipe(dest(`dev/fonts/`))
		// Ищем файлы шрифтов .ttf
		.pipe(src(`dev/fonts/*.ttf`))
		// Конвертируем в .woff
		.pipe(fonter({
			formats: ['woff']
		}))
		// Выгружаем в исходную папку
		.pipe(dest(`dev/fonts/`))
		// Ищем файлы шрифтов .ttf
		.pipe(src(`dev/fonts/*.ttf`))
		// Конвертируем в .woff2
		.pipe(ttf2woff2())
		// Выгружаем в исходную папку
		.pipe(dest(`dev/fonts/`))
		// Ищем файлы шрифтов .woff,.woff2
		.pipe(src(`dev/fonts/*.{woff,woff2}`))
		// Выгружаем в исходную папку
		.pipe(dest(`dev/fonts/`))
}
exports.outToTtf = outToTtf;

// создание файла шрифтов
const fontsStyle = () => {
	let fontsFile = `dev/style/scss/fonts.scss`;
	// Проверяем существует ли файлы шрифтов
	fs.readdir('dev/fonts/', function (err, fontsFiles) {
		if (fontsFiles) {
			// Проверяем существует ли файл стилей для подключения шрифтов
			if (!fs.existsSync(fontsFile)) {
				// Если файла нет, создаём его
				fs.writeFile(fontsFile, '', cb);
				let newFileOnly;
				for (var i = 0; i < fontsFiles.length; i++) {
					// Записываем подключения шрифтов в файл стилей
					let fontFileName = fontsFiles[i].split('.')[0];
					if (newFileOnly !== fontFileName) {
						let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
						let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
						if (fontWeight.toLowerCase() === 'thin') {
							fontWeight = 100;
						} else if (fontWeight.toLowerCase() === 'extralight') {
							fontWeight = 200;
						} else if (fontWeight.toLowerCase() === 'light') {
							fontWeight = 300;
						} else if (fontWeight.toLowerCase() === 'medium') {
							fontWeight = 500;
						} else if (fontWeight.toLowerCase() === 'semibold') {
							fontWeight = 600;
						} else if (fontWeight.toLowerCase() === 'bold') {
							fontWeight = 700;
						} else if (fontWeight.toLowerCase() === 'extrabold' || fontWeight.toLowerCase() === 'heavy') {
							fontWeight = 800;
						} else if (fontWeight.toLowerCase() === 'black') {
							fontWeight = 900;
						} else {
							fontWeight = 400;
						}
						fs.appendFile(fontsFile, `@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`, cb);
						newFileOnly = fontFileName;
					}
				}
			}
			else {
				console.log("Файл scss/fonts.scss уже существует. Для обновления файла нужно его удалить")
			}
		}
	});
	return src(`./dev`);
	function cb() { }
}
exports.fontsStyle = fontsStyle;

// сжатие картинок
function imageCompress() {
	return src('dev/images/**/*.{jpg,jpeg,png}')
		.pipe(imagemin([imagemin.optipng({ optimizationLevel: 7 })]))
		.pipe(dest('release/images'))
}
exports.imageCompress = imageCompress;

// копирование папки libraries
function libraries() {
	return src([
		'dev/libraries/**/*',
	])
		.pipe(dest('release/libraries'))
		.pipe(browserSync.stream())
}
exports.libraries = libraries;

// копирование картинок
function imageCopy() {
	return src([
		'dev/images/**/*',
	])
		.pipe(dest('release/images'))
		.pipe(browserSync.stream())
}
exports.imageCopy = imageCopy;

// копирование файлов шрифтов
function copyfonts() {
	return src([
		`dev/fonts/*.{woff,woff2}`,
	])
		.pipe(dest('release/fonts'))
}
exports.copyfonts = copyfonts;


// Основные задачи
const mainTasks = series(reset, copyfonts, parallel(scriptsCopy, cssCopy, imageCopy, scss2cssMain, libraries));

// Построение сценариев выполнения задач
const addfonts = series(outToTtf, fontsStyle);
const dev = series(mainTasks, fileincludeDev, scriptsConcat, styleConcat, parallel(watching, browserSyncFunction));
const build = series(mainTasks, building, fileincludeBuild, parallel(scriptsComponent, scss2cssComponent, styleConcatCommon, scriptsConcatCommon));

exports.default = dev;
exports.build = build;
exports.addfonts = addfonts;