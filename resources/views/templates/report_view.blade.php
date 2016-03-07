<!DOCTYPE html>
<html lang="en">
	<head>
		<title>{{ ucwords($title) }} - Web App</title>
		<!-- Data Tables -->
		<link rel="stylesheet" type="text/css" href="/css/plugins/dataTables/dataTables.bootstrap.css">
		<link rel="stylesheet" type="text/css" href="/css/plugins/dataTables/dataTables.responsive.css">
		<link rel="stylesheet" type="text/css" href="/css/plugins/dataTables/dataTables.tableTools.min.css">
		@include('templates.headers')
	</head>
	<body class="navbar-fixed fixed-sidebar">
		<div id="wrapper">
			@include('templates.vertical_nav')
			<div id="page-wrapper" class="gray-bg">
				@include('templates.navbar')
				<div class="row wrapper border-bottom white-bg page-heading app-breadcrumb">
					<div class="col-sm-10">
						<ol class="breadcrumb">
							<li>
								<a href="/app">Home</a>
							</li>
							<li>
								<a href="/app/reports">Report</a>
							</li>
							<li class="active">
								<strong>{{ ucwords($title) }}</strong>
							</li>
						</ol>
					</div>
				</div>
				<div class="wrapper wrapper-content animated fadeInRight">
					<div class="row">
						<div class="col-sm-12">
							<div class="ibox">
								<div class="ibox-title floatbox-title">
									<div class="form-name">
										<i class="fa fa-list"></i> {{ ucwords($title) }}
									</div>
									<div class="ibox-tools">
										<a class="btn btn-white btn-sm" id="download_report" name="download_report" 
											data-toggle="tooltip" data-placement="bottom" data-container="body" title="Download Report in Excel format">
											<i class="fa fa-download"></i> Download
										</a>
										<a class="btn btn-primary btn-sm" id="refresh_report" name="refresh_report"
											data-toggle="tooltip" data-placement="bottom" data-container="body" title="Filter Report">
											<i class="fa fa-filter"></i> Filter
										</a>
									</div>
								</div>
								<div class="ibox-content">
									@if (view()->exists('layouts/reports/' . strtolower(str_replace(" ", "_", $title))))
										@include($file)
									@endif
								</div>
								<div class="ibox-content">
									<div style="height: 375px; margin-bottom: 0px; padding: 0px;" class="panel-body scrollbar scroll-x scroll-y table-responsive b-t">
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
											<tbody>
												@if (isset($rows) && $rows && (count($rows) > 0))
													@var $counter = 0
													@foreach ($rows as $row)
														<tr>
															<td>{{ $counter += 1 }}</td>
															@foreach ($columns as $column)
																<td data-field-name="{{ $column }}" data-toggle="tooltip" data-placement="bottom" data-container="body"
																	title="{{ (isset($row->$column) && $row->$column) ? $row->$column : "" }}">
																	@if (isset($module) && $module
																		&& isset($link_field) && $link_field
																		&& isset($record_identifier) && $record_identifier
																		&& $column == $record_identifier)
																			<a href="/form/{{ $module }}/{{ $row->$link_field }}">{{ (isset($row->$column) && $row->$column) ? $row->$column : "" }}</a>
																	@else
																		{{ (isset($row->$column) && $row->$column) ? $row->$column : "" }}
																	@endif
																</td>
															@endforeach
														</tr>
													@endforeach
												@endif
											</tbody>
										</table>
									</div>
								</div>
								<div class="ibox-content">
									<strong>Total : <span class="badge bg-primary" id="item-count">{{ $count }}</span> item(s)</strong>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		@include('templates.msgbox')
		@if (Session::has('msg'))
			<script type="text/javascript">
				msgbox("{{ Session::get('msg') }}");
			</script>
		@endif
		<!-- Data Tables -->
		<script type="text/javascript" src="/js/plugins/dataTables/jquery.dataTables.js"></script>
		<script type="text/javascript" src="/js/plugins/dataTables/dataTables.bootstrap.js"></script>
		<script type="text/javascript" src="/js/plugins/dataTables/dataTables.responsive.js"></script>
		<script type="text/javascript" src="/js/plugins/dataTables/dataTables.tableTools.min.js"></script>
		<script type="text/javascript" src="/js/web_app/report_view.js"></script>
	</body>
</html>