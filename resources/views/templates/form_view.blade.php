@extends('layouts.app')

@var $page_title = isset($form_data[$table_name]['id']) ? $form_data[$table_name][$form_title] : $title
@section('title', $page_title . ' - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', $page_title)

@section('data')
    <script type="text/javascript">
        window.origin = {
            data: <?php echo isset($form_data) ? json_encode($form_data) : json_encode(false) ?>,
            title: "{{ $title }}",
            slug: "{{ $slug }}",
            module: "{{ $module }}",
            changed: false,
            table_name: "{{ $table_name }}",
            permissions: <?php echo isset($permissions) ? json_encode($permissions) : json_encode(false) ?>
        };
    </script>
@endsection

{{-- Hide breadcrumbs for Single type Modules eg. Settings --}}

@if (!isset($module_type))
    @section('breadcrumb')
        <section class="content-header">
            <h1>&nbsp;</h1>
            <ol class="breadcrumb app-breadcrumb">
                <li>
                    <a href="{{ route('show.app.modules') }}">Home</a>
                </li>
                <li>
                    <a href="{{ route('show.list', $slug) }}">{{ $title }}</a>
                </li>
                <li class="active">
                    <strong>{{ isset($form_data[$table_name]['id']) ? $form_data[$table_name][$form_title] : "New $title" }}</strong>
                </li>
            </ol>
        </section>
    @endsection
@endif

@section('body')
    <div class="row">
        <div class="col-sm-12 form-container">
            <div class="box">
                <div id="sticky-anchor"></div>
                <div class="box-header with-border" id="sticky">
                    <div class="box-title floatbox-title">
                        <div class="form-name">
                            @if (isset($module_type) && $module_type == "Single")
                                <i class="{{ $icon }}"></i> {{ $title }}
                            @else
                                <i class="{{ $icon }}"></i> {{ isset($form_data[$table_name]['id']) ? $form_data[$table_name][$form_title] : "New $title" }}
                            @endif

                            @if (isset($form_data[$table_name]['id']) && $permissions['update'])
                                <div class="form-status non-printable">
                                    <small>
                                        <span class="text-center" id="form-stats">
                                            <i class="fa fa-circle text-success"></i>
                                            <span id="form-status">Saved</span>
                                        </span>
                                    </small>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="box-tools non-printable">
                        <ul class="no-margin pull-right">
                            @if ((isset($module_type) && $module_type == "Single") || $permissions['update'])
                                <button type="submit" class="btn btn-success disabled" id="save_form" disabled>
                                    <span class="hidden-xs">Save</span>
                                    <span class="visible-xs"><i class="fa fa-floppy-o"></i></span>
                                </button>
                            @endif
                            @if (isset($form_data[$table_name]['id']) && ($permissions['create'] || $permissions['delete']))
                                <div class="btn-group">
                                    <button data-toggle="dropdown" class="btn btn-primary dropdown-toggle">
                                        Menu <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu dropdown-left">
                                        @if ($permissions['create'])
                                            <li>
                                                <a href="{{ route('copy.doc', ['slug' => $slug, 'id' => $form_data[$table_name][$link_field]]) }}">
                                                    Duplicate
                                                </a>
                                            </li>
                                        @endif
                                        @if ($permissions['delete'])
                                            <li>
                                                <a href="#" id="delete" name="delete">
                                                    Delete
                                                </a>
                                            </li>
                                        @endif
                                        @if ($permissions['create'])
                                            <li>
                                                <a href="{{ route('new.doc', $slug) }}">
                                                    New {{ $title }}
                                                </a>
                                            </li>
                                        @endif
                                    </ul>
                                </div>
                            @endif
                        </ul>
                    </div>
                </div>
                <div class="box-body form-body">
                    @if (isset($module_type) && $module_type == "Single")
                        @include($file)
                    @else
                        @if (isset($form_data[$table_name]['id']) && $form_data[$table_name]['id'])
                            @var $action = route('show.doc', ['slug' => $slug, 'id' => $form_data[$table_name]['id']])
                        @else
                            @var $action = route('new.doc', $slug)
                        @endif
                        <form method="POST" action="{{ $action }}" name="{{ $slug }}" id="{{ $slug }}" enctype="multipart/form-data">
                            {!! csrf_field() !!}
                            <input type="hidden" name="id" id="id" class="form-control" data-mandatory="no" autocomplete="off" readonly>
                            @if (view()->exists(str_replace('.', '/', $file)))
                                @include($file)
                            @else
                                Please create '{{ str_replace('.', '/', $file) }}.blade.php' in views
                            @endif
                        </form>
                    @endif
                </div>
            </div>
            <div class="data-loader" style="display: none;">Saving...</div>
        </div>
    </div>
@endsection

@push('scripts')
    <script type="text/javascript" src="{{ url('/js/origin/form.js') }}"></script>
    <script type="text/javascript" src="{{ url('/js/origin/table.js') }}"></script>
    @if (File::exists(public_path('/js/origin/' . snake_case($module) . '.js')))
        <!-- Include client js file -->
        <script type="text/javascript" src="{{ url('/js/origin') }}/{{ snake_case($module) }}.js"></script>
    @endif
@endpush
