// ===========
// Plagin Init
// ===========
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'postcss-*', 'autoprefixer', 'css-mqpacker', 'lost'],
	replaceString: /^(postcss|gulp|css)(-|\.)/,
	rename: {
		'gulp-if': 'gulpif',
		'postcss-for': 'postcssfor',
		'jshint-stylish': 'stylish'
	}
});

// ===========
// Varible
// ===========
var path = {
	dist: {
		html: 'dist/',
		css: 'dist/css/',
		js: 'dist/js/',
		img: 'dist/img/',
	},
	src: {
		data: './src/data/data.json',
		jade: 'src/jade/*.jade',
		css: 'src/css/style.css',
		js: 'src/js/*.js',
		fonts: 'src/fonts/*',
		img: 'src/img/**/*.{jpg,png,svg}',
	},
	watch: {
		html: 'src/jade/**/*.jade',
		css: 'src/css/**',
		js: 'src/js/**',
		fonts: 'src/fonts/*',
		img: 'src/img/**',
	},
	clean: 'dist/*'
};

// ===========
// Tasks
// ===========
gulp.task('clean', function() {
	return gulp.src(path.clean, {
			read: false
		})
		.pipe(plugins.ignore('sftp-config.json'))
		.pipe(plugins.rimraf());
});

gulp.task('html', function() {
	return gulp.src(path.src.jade)
		// .pipe(plugins.watch(path.src.jade))
		.pipe(plugins.plumber())
		.pipe(plugins.data(function() {
			return require(path.src.data);
		}))
		.pipe(plugins.jade({
			pretty: true
		}))
		.pipe(plugins.prettify({
			indent_size: 4,
			max_preserve_newlines: 0,
			preserve_newlines: true
		}))
		.pipe(plugins.useref())
		.pipe(plugins.gulpif('*.js', plugins.jshint()))
		.pipe(plugins.gulpif('*.js', plugins.jshint.reporter('jshint-stylish')))
		.pipe(plugins.gulpif('*.js', plugins.uglify()))
		.pipe(plugins.gulpif('*.css', plugins.minifyCss()))
		.pipe(gulp.dest(path.dist.html))
		.pipe(plugins.connect.reload());
});

gulp.task('css', function() {
	var processors = [
		plugins.easyImport({
			partial: false,
			extensions: ['.css'],
			glob: true
		}),
		plugins.advancedVariables(),
		plugins.nested,
		plugins.postcssfor,
		plugins.lost,
		plugins.selectorMatches,
		plugins.mixins,
		plugins.customMedia(),
		plugins.colorShort,
		plugins.center,
		plugins.customSelectors,
		plugins.focus,
		plugins.extend,
		plugins.clearfix,
		plugins.responsiveImages,
		plugins.selectorNot,
		plugins.short,
		// plugins.mqpacker
	];
	return gulp.src(path.src.css)
		.pipe(plugins.plumber())
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.postcss(processors))
		//.pipe(plugins.minifyCss())
		.pipe(plugins.sourcemaps.write('/sourcemap'))
		.pipe(gulp.dest(path.dist.css))
		.pipe(plugins.connect.reload());
});

gulp.task('js', function() {
	return gulp.src(path.src.js)
		.pipe(plugins.plumber({
			errorHandler: function(err) {
				console.log('Error:', err);
			}
		}))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'))
		.pipe(plugins.babel({
			presets: ['@babel/env']
		}))
		.pipe(plugins.uglify())
		.pipe(gulp.dest(path.dist.js))
		.pipe(plugins.connect.reload());
});

gulp.task('img', function() {
	return gulp.src(path.src.img, {encoding: false})
		.pipe(gulp.dest(path.dist.img))
		.pipe(plugins.connect.reload());
});

gulp.task('build', gulp.series('html', 'js', 'css', 'img'));

gulp.task('connect', function() {
	plugins.connect.server({
		root: 'dist',
		livereload: true
	});
});

gulp.task('watch', function() {
	gulp.watch(path.watch.html, gulp.series('html'));
	gulp.watch(path.watch.css, gulp.series('css'));
	gulp.watch(path.watch.js, gulp.series('js'));
	gulp.watch(path.watch.img, gulp.series('img'));
});

gulp.task('default', gulp.series('build', 'connect', 'watch'));
