@extends('layouts.app')

@section('title', ucwords($title) . ' - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', ucwords($title))

@push('styles')
    <link type="text/css" rel="stylesheet" href="{{ url(mix('css/origin/app-report.css')) }}">
@endpush

@section('body')
    <div class="box">
        <div class="box-header with-border">
            <h3 class="box-title">
                <i class="fa fa-list"></i> {{ ucwords($title) }}
            </h3>
            <div class="box-tools">
                <ul class="no-margin pull-right">
                    <a class="btn btn-default btn-sm" id="download_report" name="download_report" 
                        data-toggle="tooltip" data-placement="bottom" data-container="body" title="Download Report in Excel format">
                        <i class="fa fa-download"></i> Download
                    </a>
                    @if (view()->exists('layouts/reports/' . strtolower(str_replace(" ", "_", $title))))
                        <a class="btn btn-primary btn-sm" id="filter_report" name="refresh_report"
                            data-toggle="tooltip" data-placement="bottom" data-container="body" title="Filter Report">
                            <i class="fa fa-filter"></i> Filter
                        </a>
                    @endif
                </ul>
            </div>
        </div>
        @if (view()->exists('layouts/reports/' . strtolower(str_replace(" ", "_", $title))))
            <div class="box-header with-border">
                @include($file)
            </div>
        @endif
        <div class="box-body table-responsive">
            <table class="table table-bordered" id="report-table" data-report-name="{{ $title }}">
                <thead class="panel-heading text-small">
                    <tr>
                        <th>#</th>
                        @if (isset($columns) && $columns)
                            @foreach ($columns as $column)
                                @var $col_head = str_replace("Id", "ID", awesome_case($column))
                                <th name="{{ $column }}">{{ $col_head }}</th>
                            @endforeach
                        @endif
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <div class="data-loader" style="display: none;">Loading...</div>
        </div>
    </div>
@endsection

@push('scripts')
    <script type="text/javascript" src="{{ url(mix('js/origin/app-report.js')) }}"></script>
@endpush
