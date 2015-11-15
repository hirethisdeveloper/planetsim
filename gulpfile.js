'use strict';
var gulp = require("gulp"),
    sass = require('gulp-sass');
gulp.task('sass', function () {
    gulp.src('./app/styles/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./app/styles'));
});
gulp.task('sass:watch', function () {
    gulp.watch('./app/styles/sass/**/*.scss', ['sass']);
});