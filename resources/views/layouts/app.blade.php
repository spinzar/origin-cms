<!DOCTYPE html>
<html lang="en">
    <head>
        <title>@yield('title')</title>
        @stack('meta')
        @include('templates.headers')
        @stack('styles')

        @section('data')
            <script type="text/javascript">
                window.origin = {
                    data: <?php echo isset($data) ? json_encode($data) : "false" ?>,
                };
            </script>
        @show
    </head>
    <body data-url="{{ route('home') }}" data-base-url="{{ url('/') }}" class="hold-transition skin-blue fixed sidebar-mini">
        <div class="wrapper">
            @include('templates.navbar')
            @include('templates.vertical_nav')
            <!-- Body -->
            <div class="content-wrapper">
                @yield('title_section')
                <section class="content">
                    @yield('body')
                </section>
            </div>
            <!-- Footer -->
            @include('templates.footer')
            @include('templates.msgbox')
        </div>
        <script type="text/javascript" src="{{ url('/js/jquery.js') }}"></script>
        <script type="text/javascript" src="{{ url(mix('js/all.js')) }}"></script>
        <script type="text/javascript">
            var font_conf = {
                google: { families: ['Source+Sans+Pro:200,300,400,600,700'] },
                timeout: 3000
            };

            WebFont.load(font_conf);
        </script>
        @if (Session::has('msg') && Session::get('msg'))
            <script type="text/javascript">
                @if (Session::has('success') && Session::get('success'))
                    notify('{!! nl2br(Session::get("msg")) !!}');
                @elseif (Session::has('success') && !Session::get('success'))
                    notify('{!! nl2br(Session::get("msg")) !!}', 'error');
                @else
                    notify('{!! nl2br(Session::get("msg")) !!}', 'info');
                @endif
            </script>
        @endif
        @stack('scripts')
    </body>
</html>
