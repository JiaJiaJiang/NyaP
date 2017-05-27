var gulp = require('gulp');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var minimist = require('minimist');

var minimistOpt = {
	string:['es'],
	boolean:['touch'],
};

var options = minimist(process.argv.slice(2), minimistOpt);

gulp.task('_compileJS',function(){
	var name=options.touch?'NyaPTouch.js':'NyaP.js';
	var buffer = require('vinyl-buffer');
	var source = require('vinyl-source-stream');
	var babelify = require('babelify');
	var browserify = require('browserify');
	var es=options.es;

	return browserify({
			entries: name,
			basedir:'./src',
			debug: true,
		}).transform(
			babelify.configure({
				presets: [`es${es}`],
				plugins: ["transform-es2015-modules-commonjs"]
			})
		)
		.bundle()
		.pipe(source(`./${name}`))
		.pipe(rename({extname:`.es${es}.js`}))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'));
});

var esList=['2015','2016'];
gulp.task('js',function(){
	if(options.es){
		gulp.start('_compileJS');
		return;
	}
	var es=esList.shift();
	options.es=es;
	console.log('es'+es);
	return gulp.start('_compileJS',function(err){
		options.es='';
		if(esList.length){
			gulp.start('js');
		}
	});
	//return;
});

gulp.task('css', function (){
	var sass = require("gulp-sass");
	var name=options.touch?'NyaPTouch.scss':'NyaP.scss';
    return gulp.src(`./src/${name}`)
		.pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass({
            outputStyle: 'compact'
        }).on('error', sass.logError))
		.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});


gulp.task('minjs',function(){
	var uglifyjs = require('uglify-js');
	var uglify = require('gulp-uglify/minifier');
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
				.pipe(uglify(options,uglifyjs))
				.on('error',function(e){
					console.error(e);
				})
				.pipe(gulp.dest('./dist/compressed/'));
});

gulp.task('minAllScss',function(){
	var sass = require("gulp-sass");
	return gulp.src('./src/*.scss')
			    .pipe(sass({
			        outputStyle: 'compressed'
			    }).on('error', sass.logError))
				.pipe(rename({extname:'.min.css'}))
			    .pipe(gulp.dest('./dist/compressed/'));
});

gulp.task('mincss',['minAllScss'],function(){
	require('fs').unlinkSync('./dist/compressed/NyapCore.min.css');
});


gulp.task('build',['js','css']);

gulp.task('min',['mincss','minjs']);

gulp.task('default',['build'],function(cb){
	gulp.start('min',cb);
});
