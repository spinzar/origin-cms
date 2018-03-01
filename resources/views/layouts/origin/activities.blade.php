@extends('layouts.app')

@section('title', 'Activities - ' . env('BRAND_NAME', 'Origin CMS'))
@section('search', 'Activities')

@section('title_section')
    <div id="sticky-anchor"></div>
    <section class="content-header title-section" id="sticky">
        <div class="row">
            <div class="col-md-6 col-sm-6 col-xs-8">
                <div class="form-name">
                    <i class="fa fa-bell"></i> Activities
                </div>
            </div>
            <div class="col-md-6 col-sm-6 col-xs-4 text-right">
                <button class="btn btn-primary btn-sm refresh-activity" data-toggle="tooltip" 
                    data-placement="bottom" data-container="body" title="Refresh">
                    <span class="hidden-xs">Refresh</span>
                    <span class="visible-xs"><i class="fa fa-refresh"></i></span>
                </button>
            </div>
        </div>
    </section>
@endsection

@section('body')
    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-body">
                    <div class="row">
                        <div class="col-md-8 col-md-offset-2">
                            <ul class="timeline origin-activities"></ul>
                        </div>
                    </div>
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
