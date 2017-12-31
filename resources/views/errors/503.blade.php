<!DOCTYPE html>
<html lang="en">
    <head>
        <title>503 Error | Service Temporarily Unavailable | {{ env('BRAND_NAME', 'Origin CMS') }}</title>
        <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700" rel="stylesheet">
        @include('templates.headers')
    </head>
    <body class="nav-md">
        <div class="container body">
            <div class="main_container">
                <div class="col-md-12">
                    <div class="col-middle">
                        <div class="text-center text-center">
                            <h1 class="error-number">500</h1>
                            <h2>Service Temporarily Unavailable</h2>
                            <p>We track these errors automatically, but if the problem persists feel free to contact us. In the meantime, try refreshing.</p>
                            <div class="mid_center">
                                <a href="{{ route('home') }}" class="btn btn-success">
                                    Back to Home
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
