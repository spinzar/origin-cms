<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Password Reset - {{ env('BRAND_NAME', 'Origin CMS') }}</title>
        <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700" rel="stylesheet">
        @include('templates.headers')
    </head>
    <body class="login">
        @if (Session::has('first_login_msg') && Session::get('first_login_msg'))
            <div class="row">
                <div class="col-md-6 col-md-offset-3">
                    <div class="alert alert-info text-center">
                        {{ Session::get('first_login_msg') }}
                    </div>
                </div>
            </div>
        @endif
        <div>
            <div class="login_wrapper">
                <div class="animate form login_form">
                    <section class="login_content">
                        <form action="{{ route('post.reset.password') }}" method="POST" name="password_reset" id="password_reset">
                            <h1>Password Reset</h1>
                            @if (count($errors) > 0)
                                @foreach ($errors->all() as $error)
                                    <div class="block">
                                        <div class="alert red-bg">
                                            <button type="button" class="close" data-dismiss="alert">
                                                <i class="fa fa-times"></i>
                                            </button>
                                            <strong>
                                                <i class="fa fa-exclamation-triangle fa-lg"></i>
                                                {{ $error }}
                                            </strong>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
                            {!! csrf_field() !!}
                            <input type="hidden" name="token" value="{{ $token }}">
                            <div>
                                @if ($email)
                                    <input type="text" name="email" class="form-control" placeholder="Email Address" value="{{ $email or old('email') }}" required autofocus readonly>
                                @else
                                    <input type="text" name="email" class="form-control" placeholder="Email Address" value="{{ $email or old('email') }}" required autofocus>
                                @endif
                            </div>
                            <div>
                                <input type="password" name="password" class="form-control" placeholder="Password">
                            </div>
                            <div>
                                <input type="password" name="password_confirmation" class="form-control" placeholder="Confirm Password">
                            </div>
                            <div>
                                <button type="submit" class="btn btn-block btn-default submit">
                                    Reset Password
                                </button>
                            </div>
                            <div class="clearfix"></div>
                            <div class="separator">
                                <div>
                                    <h1>
                                        <i class="fa fa-eye"></i>
                                        {{ env('BRAND_NAME', 'Origin CMS') }}
                                    </h1>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="{{ url('/js/jquery.js') }}"></script>
    </body>
</html>
