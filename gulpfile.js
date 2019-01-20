var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
// var minimist = require('minimist');
// var changed = require('gulp-changed');

var dist='./dist';

//css
function transcss(name){
	var sass = require("gulp-sass");

	return gulp.src(`./src/${name}`)
		// .pipe(changed(dist))
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist));
}

gulp.task('css-NyaPTouch',function(){
	return transcss('NyaPTouch.scss');
});
gulp.task('css-NyaP',function(){
	return transcss('NyaP.scss');
});

gulp.task('css',gulp.parallel('css-NyaP','css-NyaPTouch'));



//js
function transjs(name,cover=90){
	var babelify = require('babelify'),
		browserify = require('browserify'),
		buffer = require('vinyl-buffer'),
		source = require('vinyl-source-stream'),
		rename = require('gulp-rename');

	console.log(`compiling ${name} covers ${cover}% browsers`);

	return browserify({
			entries: name,
			basedir:'./src',
			debug: true,
			// sourceType: 'module'
		})
		.transform(
			"babelify",{
				presets: [
					[
						"@babel/preset-env",{
							"targets":{ 
								"browsers":`cover ${cover}%`
							},
							"debug": true,
							"useBuiltIns": 'usage'
						}
					],
					/*["minify", {
						// "mangle": {
						// 	"exclude": ["MyCustomError"]
						// },
						//"keepFnName": true
					}]*/
				],
			}
		)
		.bundle()
		.pipe(source(`./${name}`))
		.pipe(rename({extname:`.${cover}.js`}))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist));
}
gulp.task('js-NyaPTouch-cover-50',function(){
	return transjs('NyaPTouch.js',50)||console.log('poi');
});
gulp.task('js-NyaP-cover-50',function(){
	return transjs('NyaP.js',50);
});
gulp.task('js-NyaPTouch-cover-80',function(){
	return transjs('NyaPTouch.js',80);
});
gulp.task('js-NyaP-cover-80',function(){
	return transjs('NyaP.js',80);
});

gulp.task('js-NyaP',gulp.parallel(
	'js-NyaP-cover-50','js-NyaP-cover-80'
));
gulp.task('js-NyaPTouch',gulp.parallel(
	'js-NyaPTouch-cover-50','js-NyaPTouch-cover-80'
));

gulp.task('js',gulp.parallel(
	'js-NyaP','js-NyaPTouch'
));


gulp.task('build',gulp.parallel('js','css'));
gulp.task('default',gulp.series('build'));
