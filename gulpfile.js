var gulp = require("gulp");
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps')
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var notifier = require('node-notifier');

//Directories you want to watch.
var directories = ["./*.html", "scripts/*.js", "./*.css", "pages/*.html", "./scripts/*/*.js"];

gulp.task('reload', function() {
    gulp.watch(directories).on('change', browserSync.reload);
});

gulp.task('javascript', function() {
    return gulp.src(['./scripts/*.js', './scripts/*/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(uglify({ compress: {drop_console: false }}))
        .on('error', function(e) {
            console.log(e);
            notifier.notify("Javascript error");
            process.exit()
        })
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('dist/scripts'));
    console.log("compressing");
})

gulp.task('javascript:watch', function() {
    console.log('Minifying JS');
    gulp.watch(['./scripts/*.js', './scripts/*/*.js'], ['javascript']);
})

gulp.task('sass', function() {
    return gulp.src(['sass/app.scss', 'sass/form.scss'])
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/styling/'))
        .pipe(browserSync.stream());
});

gulp.task('sass:watch', function() {
    console.log('sass code');
    gulp.watch('sass/*.scss', ['sass']);
});

gulp.task('build', ['sass'], function(){
    gulp.src(['./scripts/*.js', './scripts/*/*.js'])
        .pipe(concat('app.js'))
        .pipe(uglify({ 
            compress: {
                drop_console: true  
            }
        }))
        .on('error', function(e) {
            console.log(e);
            notifier.notify("Javascript error");
            process.exit()
        })
        .pipe(gulp.dest('dist/scripts'));
})

// Wont reopen the browser, useful for when the gulp task needs to be restarted.
gulp.task('run', ['default'], function() {
    browserSync.init({ server: { baseDir: "./" }, open: false });
})

gulp.task('serve', ['default'], function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('default', ['sass', 'sass:watch', 'reload', 'javascript:watch']);
