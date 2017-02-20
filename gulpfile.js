var browserify = require('browserify');
var babelify = require('babelify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var sass = require("gulp-sass");

gulp.task('js', function () {
	var b = browserify(['NyaP.js'],{
		basedir:'./src',
		debug: true,
		transform: [babelify.configure({
			presets: ['es2015']
		})]
	});

	return b.bundle()
		.pipe(source('./NyaP.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'));
});


gulp.task('minjs',function(){
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
		return gulp.src('./dist/NyaP.js')
		.pipe(rename({extname:'.min.js'}))
		.pipe(uglify(options))
		.pipe(gulp.dest('./dist'));
});

gulp.task('mincss', function(){
		 gulp.src('./src/NyaP.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
		.pipe(rename({extname:'.min.css'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('css', function (){
    gulp.src('./src/NyaP.scss')
		.pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass({
            outputStyle: 'compact'
        }).on('error', sass.logError))
		.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('jscss',['js','css']);

gulp.task('release',['js','minjs','mincss']);
