const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const svgmin = require('gulp-svgmin');
const twig = require('gulp-twig');
const uglify = require('gulp-uglify-es').default;
const svgstore = require('gulp-svgstore');
const cheerio = require('gulp-cheerio');
const merge = require('merge-stream');

gulp.task('twig', function () {
    return gulp.src([
        'source/layout/*.twig',
    ])
      .pipe(twig())
      .pipe(gulp.dest('source/'))
      .pipe(browserSync.reload({ stream: true }))
  });

gulp.task('twig-blog', function () {
    return gulp.src([
        'source/layout/blog/**/*.twig',
    ])
        .pipe(twig())
        .pipe(gulp.dest('source/blog'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('twig-articles', function () {
    return gulp.src([
        'source/layout/articles/**/*.twig',
    ])
        .pipe(twig())
        .pipe(gulp.dest('source/articles'))
        .pipe(browserSync.reload({ stream: true }));
});


gulp.task('scss', function () {
    return gulp.src('source/scss/**/style.scss')
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 8 versions'],
            cascade: false
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('source/assets/css'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('css', function () {
    return gulp.src([
        'node_modules/normalize.css/normalize.css',
        'node_modules/animate.css/animate.css'
    ])
        .pipe(concat('libs.scss'))
        .pipe(gulp.dest('source/scss'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('html', function () {
    return gulp.src('source/*.html')
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('js', function () {
    return gulp.src('source/js/*.js')
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('libs', function (){
    return gulp.src([
        'node_modules/wow.js/dist/wow.js'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('source/js'))
    .pipe(browserSync.reload({ stream: true }))
});

gulp.task('icons-twig', function () {
    return gulp.src('source/assets/images/icons/*.svg')
        .pipe(svgmin({
            plugins: [
                { removeViewBox: false },
                { cleanupIDs: false }
            ]
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore({ inlineSvg: true }))
        .pipe(cheerio({
            run: function ($) {
                $('svg')
                    .attr('class', 'svg-sprite')
                    .attr('style', 'position:absolute;width:0;height:0;overflow:hidden');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(rename('_icons.twig'))
        .pipe(gulp.dest('source/layout/partials/'));
});

gulp.task('watch', function () {
    gulp.watch('source/**/*.scss', gulp.parallel('scss'));
    gulp.watch('source/*.html', gulp.parallel('html'));
    gulp.watch('source/layout/**/*.twig', gulp.parallel('twig', 'twig-blog', 'twig-articles'));
    gulp.watch('source/js/*.js', gulp.parallel('js'));
    gulp.watch('source/assets/images/icons/*.svg', gulp.parallel('icons-twig', 'twig'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "source/"
        }
    });
});

gulp.task('clean', async function () {
    del.sync('build')
});

gulp.task('export', function () {
    const buildHtml = gulp.src('source/**/*.html')
        .pipe(gulp.dest('build'));

    const buildCss = gulp.src('source/assets/css/**/*.css')
        .pipe(gulp.dest('build/assets/css'));

    const buildJs = gulp.src([
        'source/js/min/**/*.min.js',
        'source/js/libs.min.js'
    ], { allowEmpty: true })
        .pipe(gulp.dest('build/js'));

    const buildFonts = gulp.src('source/assets/fonts/**/*.*', { allowEmpty: true })
        .pipe(gulp.dest('build/assets/fonts'));

    const buildImages = gulp.src('source/assets/images/**/*.*', { allowEmpty: true })
        .pipe(gulp.dest('build/assets/images'));

    return merge(buildHtml, buildCss, buildJs, buildFonts, buildImages);
});

gulp.task('images', function () {
    return gulp.src('source/assets/images/*.{png,jpg,ico}')
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 80, progressive: true }),
            imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { removeUnusedNS: false },
                    { removeUselessStrokeAndFill: false },
                    { cleanupIDs: false },
                    { removeComments: true },
                    { removeEmptyAttrs: true },
                    { removeEmptyText: true },
                    { collapseGroups: true }
                ]
            })
        ]))
        .pipe(gulp.dest('build/assets/images'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('script', function () {
    return gulp.src('source/js/*.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('source/js/min'))
})

gulp.task('svg', function () {
    return gulp.src('source/assets/images/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('build/assets/images'))
});

gulp.task('build', gulp.series(
    'clean',
    'icons-twig',
    gulp.parallel('twig', 'twig-blog', 'twig-articles'),
    gulp.parallel('scss', 'libs'),
    gulp.parallel('images', 'svg', 'script'),
    'export'
));

gulp.task('default', gulp.parallel('twig', 'twig-blog', 'twig-articles', 'icons-twig', 'css', 'scss', 'libs', 'js', 'browser-sync', 'watch'));
