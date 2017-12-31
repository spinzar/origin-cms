<?php

namespace App\Http\Controllers\Auth;

use DB;
use Auth;
use Session;
use App\Http\Controllers\Controller;
use App\Http\Controllers\CommonController;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    use CommonController;

    /**
     * Show the application login form.
     *
     * @return Response
     */
    public function getLogin()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        } else {
            return view('auth.login');
        }
    }

    /**
     * Handle a login request to the application.
     *
     * @return Response
     */
    public function postLogin(Request $request)
    {
        $credentials = [
            'login_id' => $request->login_id,
            'password' => $request->password,
            'is_active' => '1'
        ];

        if (Auth::attempt($credentials)) {
            return $this->afterSuccessLogin();
        }

        return back()->with([
            'msg' => 'Login ID or Password is incorrect',
            'success' => false
        ]);
    }


    // functions to be performed after successful login of user
    public function afterSuccessLogin()
    {
        $this->putAppSettingsInSession();

        $activity_data = [
            'module' => 'Auth',
            'icon' => 'fa fa-sign-in',
            'user' => auth()->user()->full_name,
            'user_id' => auth()->user()->id,
            'login_id' => auth()->user()->login_id,
            'action' => "Login",
        ];

        $this->saveActivity($activity_data);
        return redirect()->route('home');
    }


    /**
     * Log the user out of the application.
     *
     * @return Response
     */
    public function getLogout(Request $request)
    {
        $activity_data = [
            'module' => 'Auth',
            'icon' => 'fa fa-sign-out',
            'user' => auth()->user()->full_name,
            'user_id' => auth()->user()->id,
            'login_id' => auth()->user()->login_id,
            'action' => "Logout",
        ];

        $this->saveActivity($activity_data);
        Auth::logout();
        Session::flush();

        return redirect()->route('show.app.login');
    }


    /**
     * Redirect the user to the Social authentication page.
     *
     * @return Response
     */
    public function redirectToProvider($driver)
    {
        return Socialite::driver($driver)->redirect();
    }


    // handles social login
    public function handleProviderCallback($driver)
    {
        try {
            $user_profile = Socialite::driver($driver)->user();
        } catch (Exception $e) {
            return back()->with(['msg' => 'Some problem occured. Please try again...!!!']);
        }

        $common_defaults = $this->getSocialUserData('default');
        $social_defaults = $this->getSocialUserData($driver);
        $user_details = $this->populateUserData($common_defaults, $social_defaults, $user_profile, $driver);

        return $user_details;
    }


    // create user data with defaults and social defaults
    private function populateUserData($common_defaults, $social_defaults, $user_profile, $driver)
    {
        $user_details = [];

        foreach ($common_defaults as $column_name => $driver_column_name) {
            $user_details[$column_name] = $user_profile->$driver_column_name;
        }

        foreach ($social_defaults as $column_name => $driver_column_name) {
            if (is_array($driver_column_name)) {
                foreach ($driver_column_name as $column_key => $driver_column_key) {
                    $user_details[$column_key] = $user_profile->user[$column_key][$driver_column_key];
                }
            } else {
                if ($column_name == "social_profile_url") {
                    $user_details[$column_name] = $driver_column_name . $user_profile->id;
                } else {
                    $user_details[$column_name] = $user_profile->user[$driver_column_name];
                }
            }
        }

        // Insert common user related fixed data
        $user_details['social_platform'] = ucwords($driver);
        $user_details['is_active'] = '1';

        return $user_details;
    }


    // User data keys according to driver
    private function getSocialUserData($driver)
    {
        $user_data = [
            'default' => [
                'social_id' => 'id',
                'full_name' => 'name',
                'login_id' => 'email',
                'email' => 'email',
                'avatar' => 'avatar',
            ],
            'facebook' => [
                'social_profile_url' => 'https://www.facebook.com/',
            ],
            'google' => [
                'social_profile_url' => 'url',
            ]
        ];

        return $user_data[$driver];
    }
}
