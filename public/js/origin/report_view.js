$( document ).ready(function() {
	var current_page = 1;
	var filters_applied = false;
	var report_table = '';

	refresh_grid_view(current_page);
	enable_autocomplete();

	// make search and show entries element as per bootstrap
	$("#report-table_filter").find("input").addClass("form-control");
	$("#report-table_filter").find("input").attr("title", "Search in table");
	$("#report-table_filter").find("input").tooltip({
		"container": 'body',
		"placement": 'bottom',
	});
	$("#report-table_length").find("select").addClass("form-control");

	if ($("#from_date") && $("#to_date")) {
		$(function () {
			$("#fromdate").on("dp.change", function (e) {
				$("#todate").data("DateTimePicker").minDate(e.date);
			});
		});
	}

	// refresh the grid view of report
	$("#filter_report").on("click", function() {
		var filter_found = false;

		$.each($("#report-filters").find("input, select"), function() {
			if ($(this).val()) {
				filter_found = true;
			}
		});

		if (filter_found) {
			filters_applied = true;
			current_page = 1;
			refresh_grid_view(current_page);
		}
		else {
			notify("Please set any filter value", "error");
		}
	});

	// refresh grid view if record length is changed
	$('[name="report-table_length"]').on("change", function() {
		refresh_grid_view(current_page);
	});

	// refresh grid view if search is changed
	$('#report-table_filter').find('input[type="search"]').on("input change", function() {
		if ($(this).val() == "") {
			current_page = 1;
			refresh_grid_view(current_page);
		}
	});

	// get records when click on pagination links
	$(document).on('click', '.origin-pagination a', function (e) {
		if ($(this).attr('href') != "#" && $(this).attr('href').indexOf('page=') >= 0) {
			current_page = $(this).attr('href').split('page=')[1];
			refresh_grid_view(current_page);
			e.preventDefault();
		}
	});

	// download the report
	$("#download_report").on("click", function() {
		var filters = "";

		$.each($("#report-filters").find("input, select"), function() {
			if ($(this).attr("name") && $(this).val()) {
				filters += '&filters[' + $(this).attr("name") + ']=' + encodeURIComponent($(this).val().toString());
			}
		});

		window.location = app_route + "?download=Yes" + filters;
	});

	function refresh_grid_view(page) {
		$(".data-loader").show();

		$.ajax({
			type: 'GET',
			url: app_route + '?page=' + page,
			data: { 'filters': get_report_filters(), 'per_page': $('[name="report-table_length"]').val() },
			dataType: 'json',
			success: function(data) {
				if (!(report_table instanceof $.fn.dataTable.Api)) {
					create_table_headers(data['columns']);
				}

				var grid_rows = data['rows']['data'];
				var from = data['rows']['from'];
				var to = data['rows']['to'];
				var total = data['rows']['total'];
				var columns = data['columns'];
				var rows = [];
				var table_rows = [];

				$.each(grid_rows, function(grid_index, grid_data) {
					var row = {};
					$.each(columns, function(idx, column) {
						row[column] = grid_data[column];
					});

					row['id'] = grid_data['id'];
					rows.push(row);
				});

				// clear the datatable
				report_table.clear().draw();

				if (rows.length > 0) {
					// add each row to datatable using api
					$.each(rows, function(grid_index, grid_data) {
						var record = [];
						record.push(grid_index == 0 ? from : from + grid_index);

						$.each(grid_data, function(column_name, column_value) {
							var form_link = base_url + '/form/' + data["module_slug"];

							if (typeof column_value == "string") {
								if (data['module'] && data['link_field'] && data['form_title'] && (data['form_title'] == column_name) && column_value) {
									column_value = '<a href="' + form_link + '/' + grid_data[data["link_field"]] + '">' + column_value + '</a>';
								}
								else if (column_value && typeof column_value == "string" && trim(column_value).isURL()) {
									column_value = '<a href="' + column_value + '" target="_blank">' + column_value + '</a>';
								}
							}

							if (columns.contains(column_name)) {
								record.push(column_value);
							}
						});

						table_rows.push(record);
					});

					// add multiple rows to datatable using api
					report_table.rows.add(table_rows).draw('false');
				}
				else {
					$('table').find('.dataTables_empty').html("No Data");
				}

				$(".data-loader").hide();
				$("#report-table_info").html("Showing " + from + " to " + to + " of " + total + " entries");
				$("#report-table_paginate").empty().append(make_pagination(data['rows']));
			}
		});
	}

	// append columns to table headers and initiliaze datatables
	function create_table_headers(columns) {
		var headers = '<tr>\
			<th>#</th>';

		$.each(columns, function(idx, column) {
			if (column == "id") {
				var label = "ID";
			}
			else {
				var label = column.replace(/_/g, " ");
				label = label.replace("id", "ID").toProperCase();
			}

			headers += '<th name="' + column + '">' + label + '</th>';
		});

		headers += '</tr>';

		$('table#report-table').find('thead').empty().append(headers);

		report_table = $('table#report-table').DataTable({
			"scrollY": 375,
			"scrollX": true,
		});
	}

	// returns the filters for report
	function get_report_filters() {
		var filters = {};

		$.each($("#report-filters").find("input, select"), function() {
			if ($(this).attr("name") && $(this).val()) {
				filters[$(this).attr("name")] = $(this).val();
			}
		});

		if (Object.keys(filters).length > 0) {
			filters_applied = true;
		}
		else {
			filters_applied = false;
		}

		return filters;
	}

	$(window).on('hashchange', function() {
		if (window.location.hash) {
			var page = window.location.hash.replace('#', '');
			if (page == Number.NaN || page <= 0) {
				return false;
			}
			else {
				refresh_grid_view(page);
			}
		}
	});
});