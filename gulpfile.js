var gulp = require('gulp');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var minimist = require('minimist');

var minimistOpt = {
	string:['es'],
	boolean:['touch'],
	default: {es:'2015'},
};

var options = minimist(process.argv.slice(2), minimistOpt);


gulp.task('NyaP.js', function () {
	var name=options.touch?'NyaPTouch.js':'NyaP.js';
	var buffer = require('vinyl-buffer');
	var source = require('vinyl-source-stream');
	var babelify = require('babelify');
	var browserify = require('browserify');

	return browserify({
		entries: name,
		basedir:'./src',
		debug: true,
	})
	.transform(
		babelify.configure({
			presets: [`es${options.es}`],
			plugins: ["transform-es2015-modules-commonjs"]
		})
	)
	.bundle()
	.pipe(source(`./${name}`))
	.pipe(rename({extname:`.es${options.es}.js`}))
	.pipe(buffer())
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist'));
});
gulp.task('NyaP.css', function (){
	var sass = require("gulp-sass");
	var name=options.touch?'NyaPTouch.scss':'NyaP.scss';
    gulp.src(`./src/${name}`)
		.pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass({
            outputStyle: 'compact'
        }).on('error', sass.logError))
		.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});


gulp.task('minjs',function(){
	var uglify = require('gulp-uglify');
	let options = {
		mangle: true,
		compress: {
			sequences: true,
			conditionals: true,
			dead_code: true,
			booleans: true,
			if_return: true,
			join_vars: true,
			comparisons:true,
			evaluate:true,
		}
	};
	return gulp.src('./dist/*.js')
				.pipe(rename({extname:'.min.js'}))
				.pipe(uglify(options))
				.pipe(gulp.dest('./dist/compressed/'));
});

gulp.task('mincss',function(){
	var sass = require("gulp-sass");
	 gulp.src('./src/*.scss')
	    .pipe(sass({
	        outputStyle: 'compressed'
	    }).on('error', sass.logError))
		.pipe(rename({extname:'.min.css'}))
	    .pipe(gulp.dest('./dist/compressed/'));
});

gulp.task('NyaP',['NyaP.js','NyaP.css']);

