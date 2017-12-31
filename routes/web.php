<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['middleware' => ['web']], function () {
    // Website routes...
    Route::get('/', function() {
        return redirect()->route('home');
    })->name('show.website');

    // Authentication routes...
    Route::get('/login', function() {
        return redirect()->route('show.app.login');
    })->name('login');
    Route::get('/admin', ['as' => 'show.app.login', 'uses' => 'Auth\AuthController@getLogin']);
    Route::post('/login', ['as' => 'post.login', 'uses' => 'Auth\AuthController@postLogin']);
    Route::get('/logout', ['as' => 'logout', 'uses' => 'Auth\AuthController@getLogout']);

    // Password Reset routes...
    Route::get('/password/reset', ['as' => 'password.request', 'uses' => 'Auth\ForgotPasswordController@showLinkRequestForm']);
    Route::post('/password/email', ['as' => 'password.email', 'uses' => 'Auth\ForgotPasswordController@sendResetLinkEmail']);
    Route::get('/password/reset/{token}', ['as' => 'password.reset', 'uses' => 'Auth\ResetPasswordController@showResetForm']);
    Route::post('/password/reset', ['as' => 'post.reset.password', 'uses' => 'Auth\ResetPasswordController@reset']);
    Route::get('/verify/email/{token}', ['as' => 'verify.email', 'uses' => 'UserController@verifyUserEmail']);

    // Request that requires authorization...
    Route::group(['middleware' => 'auth'], function () {

        // App routes...
        Route::get('/home', ['as' => 'home', 'uses' => 'AppController@showHome']);

        // App Home page module routes...
        Route::get('/app/modules', ['as' => 'show.app.modules', 'uses' => 'ModuleController@show']);
        Route::get('/app/reports', ['as' => 'show.app.reports', 'uses' => 'ReportController@show']);
        Route::get('/app/activities', ['as' => 'show.app.activities', 'uses' => 'ActivityController@show']);
        Route::get('/app/settings', ['as' => 'show.app.settings', 'uses' => 'SettingsController@show']);
        Route::post('/app/settings', ['as' => 'save.app.settings', 'uses' => 'SettingsController@save']);
        Route::post('/update_module_sequence', ['as' => 'update.module.sequence', 'uses' => 'ModuleController@updateSequence']);

        // List View...
        Route::get('/list/{slug}', ['as' => 'show.list', 'uses' => 'ListViewController@showList']);

        // Report View...
        Route::get('/app/report/{report_name}', ['as' => 'show.report', 'uses' => 'ReportController@showReport']);

        // Autocomplete data...
        Route::get('/get_auto_complete', ['as' => 'get.autocomplete', 'uses' => 'AutocompleteController@getData']);

        // App Form/Module routes...
        Route::get('/form/{slug}', ['as' => 'new.doc', 'uses' => 'OriginController@show']);
        Route::post('/form/{slug}', ['as' => 'create.doc', 'uses' => 'OriginController@save']);
        Route::get('/form/{slug}/{id}', ['as' => 'show.doc', 'uses' => 'OriginController@show']);
        Route::get('/form/{slug}/draft/{id}', ['as' => 'copy.doc', 'uses' => 'OriginController@copy']);
        Route::post('/form/{slug}/{id}', ['as' => 'update.doc', 'uses' => 'OriginController@save']);
        Route::get('/form/{slug}/delete/{id}', ['as' => 'delete.doc', 'uses' => 'OriginController@delete']);

        // App API routes...
        Route::group(['prefix' => 'api'], function () {
            Route::post('/doc/create/{slug}', ['as' => 'api.create.doc', 'uses' => 'OriginController@save']);
            Route::get('/doc/{slug}/{id}', ['as' => 'api.get.doc', 'uses' => 'OriginController@show']);
            Route::post('/doc/update/{slug}/{id}', ['as' => 'api.update.doc', 'uses' => 'OriginController@save']);
            Route::get('/doc/delete/{slug}/{id}', ['as' => 'api.delete.doc', 'uses' => 'OriginController@delete']);
        });
    });
});
