@extends('layouts.app')

@section('title', 'Reports - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', 'Reports')

@section('body')
    <div class="rpw report-list"> 
        @foreach ($data as $report_name => $report)
            @if (isset($report['allowed_roles']) && $report['allowed_roles'] && !in_array(auth()->user()->role, $report['allowed_roles']))
                @continue
            @endif

            <div class="col-md-3 col-xs-12 report" data-href="{{ route('show.report', snake_case($report_name)) }}">
                <div class="box">
                    <div class="box-body">
                        <div style="text-align: center; margin-bottom: 17px">
                            <a href="{{ route('show.report', snake_case($report_name)) }}" class="btn btn-app" style="background-color: {{ $report['bg_color'] }}; border-color: {{ $report['bg_color'] }}; color: {{ $report['icon_color'] }};">
                                <i class="{{ $report['icon'] }}"></i>
                            </a>
                        </div>
                        <h3 class="text-center">{{ $report['label'] }}</h3>
                    </div>
                    <div class="box-footer clearfix text-center">
                        {{ $report['description'] }}
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endsection

@push('scripts')
    <script type="text/javascript">
        $( document ).ready(function() {
            // on click of report widget div navigate to report
            $(".report-list > .report").on("click", function() {
                window.location = $(this).data("href");
            });
        });
    </script>
@endpush
