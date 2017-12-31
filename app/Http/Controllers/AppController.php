<?php

namespace App\Http\Controllers;

use DB;
use Session;
use App\Http\Controllers\CommonController;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class AppController extends Controller
{
    use CommonController;

    // show home page based on app settings
    public function showHome()
    {
        $app_page = $this->getAppSetting('home_page');
        $app_page = 'show.app.' . $app_page;

        if (Session::has('msg') && Session::get('msg')) {
            return redirect()->route($app_page)->with('msg', Session::get('msg'));
        } else {
            return redirect()->route($app_page);
        }
    }
}
