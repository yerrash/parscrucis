// Less configuration
// Execute with ctrl+shift+b
var gulp = require("gulp");
var less = require("gulp-less");

gulp.task("less", function (cb) {
  gulp.src("less/parscrucis.less").pipe(less()).pipe(gulp.dest("./"));
  cb();
});

gulp.task(
  "default",
  gulp.series("less", function (cb) {
    gulp.watch("less/*.less", gulp.series("less"));
    cb();
  })
);
