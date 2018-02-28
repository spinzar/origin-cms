@extends('layouts.app')

@section('title', 'Activities - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', 'Activities')

@section('body')
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">
                        <i class="fa fa-bell"></i> Activities
                    </h3>
                </div>
                <div class="box-body">
                    <ul class="timeline origin-activities"></ul>
                </div>
                <div class="box-footer clearfix">
                    <div class="row">
                        <div class="col-md-6 col-sm-6 col-xs-5">
                            <span id="item-from"></span> -
                            <span id="item-to"></span> of 
                            <strong>
                                <span class="badge" id="item-count"></span>
                            </strong>
                        </div>
                        <div class="col-md-6 col-sm-6 col-xs-7">
                            <div class="origin-pagination-content"></div>
                        </div>
                    </div>
                </div>
                <div class="data-loader" style="display: none;">Loading...</div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script type="text/javascript" src="{{ url('/js/origin/activity.js') }}"></script>
@endpush
