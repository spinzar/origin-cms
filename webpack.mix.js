let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

/* Origin CMS Web App */

mix.styles([
    'public/css/jquery-ui.min.css',
    'public/css/bootstrap.min.css',
    'public/css/font-awesome.min.css',
    'public/plugins/toastr/toastr.min.css',
    'public/css/animate.css',
    'public/plugins/datepicker/datepicker3.css',
    'public/css/bootstrap-datetimepicker.css',
    'public/css/AdminLTE.min.css',
    'public/css/skins/skin-blue.min.css',
    'public/css/origin/origin.css',
], 'public/css/all.css').version();

mix.scripts([
    'public/js/jquery-ui.min.js',
    'public/js/jquery.highlight.js',
    'public/js/bootstrap.min.js',
    'public/plugins/slimScroll/jquery.slimscroll.min.js',
    'public/plugins/toastr/toastr.min.js',
    'public/js/bootstrap-typeahead.js',
    'public/js/moment.js',
    'public/plugins/datepicker/bootstrap-datepicker.js',
    'public/js/bootstrap-datetimepicker.js',
    'public/plugins/trumbowyg/trumbowyg.min.js',
    'public/plugins/trumbowyg/plugins/upload/trumbowyg.upload.min.js',
    'public/plugins/trumbowyg/plugins/colors/trumbowyg.colors.min.js',
    'public/plugins/trumbowyg/plugins/preformatted/trumbowyg.preformatted.min.js',
    'public/plugins/trumbowyg/plugins/table/trumbowyg.table.min.js',
    'public/js/app.min.js',
    'public/js/origin/origin.js',
    'public/js/webfontloader.js',
], 'public/js/all.js').version();

/* Origin CMS Reports */

mix.styles([
    'public/plugins/datatables/dataTables.bootstrap.css',
], 'public/css/origin/app-report.css').version();

mix.scripts([
    'public/plugins/datatables/jquery.dataTables.min.js',
    'public/plugins/datatables/dataTables.bootstrap.min.js',
    'public/js/origin/report_view.js'
], 'public/js/origin/app-report.js').version();
