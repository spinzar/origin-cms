@extends('layouts.app')

@section('title', 'Modules - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', 'Modules')

@section('body')
    @if (in_array(auth()->user()->role, ["System Administrator", "Administrator"]))
        <div class="row origin-modules sortable">
    @else
        <div class="row origin-modules">
    @endif
        @foreach ($data as $module)
            <div class="col-lg-2 col-md-3 col-xs-6 text-center m-b app-module" data-name="{{ $module['name'] }}">
                <a class="module-btn" data-href="{{ route('show.list', $module['slug']) }}" style="background-color: {{ $module['bg_color'] }}; box-shadow: inset 0px 0px 0px {{ $module['bg_color'] }}, 0px 5px 0px 0px {{ $module['bg_color'] }}, 0px 10px 5px #999999; border-color: {{ $module['bg_color'] }};" title="{{ $module['display_name'] }}">
                    <i class="{{ $module['icon'] }}" style="color: {{ $module['icon_color'] }};"></i>
                </a>
                <h3 class="module-label">
                    <a href="{{ route('show.list', $module['slug']) }}">
                        {{ $module['display_name'] }}
                    </a>
                </h3>
            </div>
        @endforeach
    </div>
@endsection

@if (in_array(auth()->user()->role, ["System Administrator", "Administrator"]))
    @push('scripts')
        <script type="text/javascript">
            $( document ).ready(function() {
                // drag and dropabble modules
                var updateIndex = function(e, ui) {
                    var modules = [];

                    $.each($(ui.item.parent().find(".app-module")), function(idx, module) {
                        var module = {
                            "name": $(module).data("name"),
                            "sequence_no": idx + 1
                        };

                        modules.push(module);
                    });

                    $.ajax({
                        type: 'POST',
                        url: base_url + '/update_module_sequence',
                        data: {'modules': modules},
                        dataType: 'json',
                        success: function(data) {
                            if (!data['success']) {
                                notify(data['msg'], 'error');
                            }
                        },
                        error: function(e) {
                            notify('Some error occured. Please try again...!!!', 'error');
                        }
                    });
                };

                $(".origin-modules").sortable({
                    stop: updateIndex,
                }).disableSelection();
            });
        </script>
    @endpush
@endif
