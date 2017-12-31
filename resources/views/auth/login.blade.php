<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Login - {{ env('BRAND_NAME', 'Origin CMS') }}</title>
        <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700" rel="stylesheet">
        @include('templates.headers')
    </head>
    <body class="hold-transition login-page">
        <div class="login-box">
            <div class="login-logo">
                <a href="{{ route('show.website') }}">
                    <b>{{ env('BRAND_NAME', 'Origin CMS') }}</b>
                </a>
            </div>
            <!-- /.login-logo -->
            <div class="login-box-body">
                <p class="login-box-msg">Sign In</p>
                <form action="{{ route('post.login') }}" method="POST" name="login-form" id="login-form">
                    @if (Session::has('msg'))
                        @if (Session::has('success') && Session::get('success') == "true")
                            <div class="block">
                                <div class="alert alert-success alert-dismissible">
                                    <button aria-hidden="true" data-dismiss="alert" class="close" type="button">×</button>
                                    <strong>
                                        <i class="fa fa-check fa-lg"></i>
                                        {{ Session::get('msg') }}
                                    </strong>
                                </div>
                            </div>
                        @else
                            <div class="block">
                                <div class="alert alert-danger alert-dismissible">
                                    <button aria-hidden="true" data-dismiss="alert" class="close" type="button">×</button>
                                    <strong>
                                        <i class="fa fa-exclamation-triangle fa-lg"></i>
                                        {{ Session::get('msg') }}
                                    </strong>
                                </div>
                            </div>
                        @endif
                    @endif
                    {!! csrf_field() !!}
                    <div class="form-group has-feedback">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <i class="fa fa-envelope"></i>
                            </span>
                            <input type="text" name="login_id" class="form-control" placeholder="Login ID">
                        </div>
                        <div class="text-danger alert" style="text-align: left; display: none;">
                            Please Enter Login ID
                        </div>
                    </div>
                    <div class="form-group has-feedback">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <i class="fa fa-lock"></i>
                            </span>
                            <input type="password" name="password" class="form-control" placeholder="Password">
                        </div>
                        <div class="text-danger alert" style="text-align: left; display: none;">
                            Please Enter Password
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-8">
                            <a href="{{ route('password.request') }}">
                                <small>Forgot password?</small>
                            </a>
                        </div>
                        <div class="col-xs-4">
                            <button type="submit" class="btn btn-primary btn-block btn-flat" id="submit-login" data-loading-text="Logging...">
                                Login
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <script type="text/javascript" src="{{ url('/js/jquery.js') }}"></script>
        <script type="text/javascript" src="{{ url('/js/origin/login.js') }}"></script>
    </body>
</html>
