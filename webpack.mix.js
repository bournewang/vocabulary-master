let mix = require('laravel-mix');

mix.setPublicPath('./')
    .sass('src/sass/popup.scss', 'dist/css')
    // .sass('src/sass/content.scss', 'dist/css')
    .copy("src/css/bootstrap5.min.css", 'dist/css')
    .copy("src/css/bootstrap5-grid.min.css", 'dist/css')
    // .copy("src/css/bootstrap5.bundle.min.css", 'dist/css')
    .js('src/js/background.js', 'dist/js')
    .js('src/js/popup.js', 'dist/js').vue()
    .js('src/js/content.js', 'dist/js').vue()
    .copy('src/options.html', 'dist')
    .copy('src/images/', 'dist/images')
    .copy('src/manifest.json', 'dist')
    .options({
        processCssUrls: false
    });
