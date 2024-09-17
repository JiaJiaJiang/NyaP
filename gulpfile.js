var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var fs=require('fs').promises;
	// var changed = require('gulp-changed');

var dist='./dist';

async function packLanguageFiles(){
	let files=await fs.readdir('./langs');
	let langsList={};
	files.forEach(f=>{
		if(!f.endsWith('.json'))return;
		let lang=f.slice(0,-5);
		console.log('language:',lang);
		langsList[lang]=require(`./langs/${f}`);
	});
	await fs.writeFile(`./src/langs.json`,JSON.stringify(langsList));
}

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
	var browserify = require('browserify'),
		buffer = require('vinyl-buffer'),
		source = require('vinyl-source-stream'),
		rename = require('gulp-rename');

	console.log(`compiling ${name} covers ${cover}% browsers`);
	return browserify({
		entries: name,
		basedir:'./src',
		debug: true,
		plugin: [
			[ require('esmify') ]
		]
	})
	.transform(
		"babelify",{ 
			presets: [
				[
					"@babel/preset-env",{
						"targets":{ 
							"browsers":`cover ${cover}%`,
						},
						"debug": false,
						"useBuiltIns": 'usage',
						"corejs":3,
					},
				],
			],
			plugins:[
				'@babel/plugin-proposal-class-properties',
				"@babel/plugin-proposal-export-default-from",
				[
					"@babel/plugin-transform-runtime",
					{
					  "absoluteRuntime": false,
					  "corejs": 3,
					  "helpers": false,
					  "regenerator": true,
					  "useESModules": false,
					}
				],
				//以下为cover依赖，不要从package.json里删除
				// "@babel/plugin-transform-modules-commonjs",
				// "regenerator-runtime",
			]
		}
	).transform(
		'uglifyify', { global: true }
	)
	.bundle()
	.pipe(source(`./${name}`))
	// .pipe(rename({extname:`.${cover}.js`}))
	.pipe(buffer())
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(dist));
}
/* gulp.task('js-NyaPTouch-cover-50',function(){
	return transjs('NyaPTouch.js',50);
});
gulp.task('js-NyaP-cover-50',function(){
	return transjs('NyaP.js',50);
}); */
gulp.task('js-NyaPTouch-cover-90',function(){
	return transjs('NyaPTouch.js',90);
});
gulp.task('js-NyaP-cover-90',function(){
	return transjs('NyaP.js',90);
});

gulp.task('js-NyaP',gulp.parallel(
	/* 'js-NyaP-cover-50', */'js-NyaP-cover-90'
));
gulp.task('js-NyaPTouch',gulp.parallel(
	/* 'js-NyaPTouch-cover-50', */'js-NyaPTouch-cover-90'
));
gulp.task('js',gulp.parallel(
	'js-NyaP','js-NyaPTouch'
));
gulp.task('lang',function(){
	return packLanguageFiles();
});
gulp.task('clean',async function(){
	let files=await fs.readdir('./dist');
	let tasks=[];
	for(let file of files){
		tasks.push(fs.unlink(`./dist/${file}`)
					.then(()=>console.log(`deleted: ${file}`))
		);
	}
	return Promise.all(tasks);
});


gulp.task('build',gulp.parallel('js','css'));
gulp.task('default',gulp.series('build'));

// setInterval(()=>{},1000)