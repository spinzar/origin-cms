@extends('layouts.app')

@section('title', ucwords($title) . ' - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', ucwords($title))

@push('styles')
    <link type="text/css" rel="stylesheet" href="{{ url(mix('css/origin/app-report.css')) }}">
@endpush

@section('breadcrumb')
    <ol class="breadcrumb app-breadcrumb">
        <li>
            <a href="{{ route('home') }}"><strong>Home</strong></a>
        </li>
        <li>
            <a href="{{ route('show.app.reports') }}"><strong>Report</strong></a>
        </li>
        <li class="active">
            {{ ucwords($title) }}
        </li>
    </ol>
@endsection

@section('title_section')
    <div id="sticky-anchor"></div>
    <section class="content-header title-section" id="sticky">
        <div class="row">
            <div class="col-md-6 col-sm-6 col-xs-8">
                <div class="form-name">
                    <i class="fa fa-sitemap"></i> {{ ucwords($title) }}
                </div>
            </div>
            <div class="col-md-6 col-sm-6 col-xs-4 text-right">
                <a class="btn btn-primary btn-sm" id="download_report" name="download_report" 
                    data-toggle="tooltip" data-placement="bottom" data-container="body" title="Download Report in Excel format">
                    <span class="hidden-xs">Download</span>
                    <span class="visible-xs"><i class="fa fa-download"></i></span>
                </a>
                @if (view()->exists('layouts/reports/' . strtolower(str_replace(" ", "_", $title))))
                    <a class="btn btn-success btn-sm" id="filter_report" name="refresh_report"
                        data-toggle="tooltip" data-placement="bottom" data-container="body" title="Filter Report">
                        <span class="hidden-xs">Filter</span>
                        <span class="visible-xs"><i class="fa fa-filter"></i></span>
                    </a>
                @endif
            </div>
        </div>
    </section>
@endsection

@section('body')
    <div class="box">
        @if (view()->exists('layouts/reports/' . strtolower(str_replace(" ", "_", $title))))
            <div class="box-header with-border report-filter-sec">
                @include($file)
            </div>
        @endif
        <div class="box-body table-responsive report-content">
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
