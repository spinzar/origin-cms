$( document ).ready(function() {
	var current_page = 1;
	var filters_applied = false;

	var report_table = $('table#report-table').DataTable({
		"scrollY": 375,
		"scrollX": true,
	});

	// get records
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
	$("#refresh_report").on("click", function() {
		var filter_found = false;
		$.each($("#report-filters").find("input, select"), function() {
			if ($(this).val()) {
				filter_found = true;
			}
		});

		if (filter_found) {
			filters_applied = true;
			refresh_grid_view(current_page);
		}
		else {
			notify("Please set any filter value", "error");
		}
	});


	// refresh grid view if record length is changed
	$('[name="report-table_length"]').on("change", function() {
		if (!filters_applied) {
			refresh_grid_view(current_page);
		}
	});


	// refresh grid view if search is changed
	$('#report-table_filter').find('input[type="search"]').on("input change", function() {
		if ($(this).val() == "" && !filters_applied) {
			refresh_grid_view(current_page);
		}
	});


	// get records when click on pagination links
	$(document).on('click', '.pagination a', function (e) {
		if ($(this).attr('href') != "#" && $(this).attr('href').indexOf('page=') >= 0 && !filters_applied) {
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
				if (filters_applied) {
					var grid_rows = data['rows'];
					var total = data['rows'].length;
				}
				else {
					var grid_rows = data['rows']['data'];
					var from = data['rows']['from'];
					var to = data['rows']['to'];
					var total = data['rows']['total'];
				}

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

						if (filters_applied) {
							record.push(grid_index + 1);
						}
						else {
							record.push(grid_index == 0 ? from : from + grid_index);
						}

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
				$('#item-count').html(total);

				if (!filters_applied) {
					$("#report-table_info").html("Showing " + from + " to " + to + " of " + total + " entries");
					$("#report-table_paginate").empty().append(make_pagination(data['rows']));
				}
			}
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


	// create pagination html
	function make_pagination(data) {
		var curr_loc = window.location.href + "?page=";
		var first_enabled = true;
		var last_enabled = true;
		var prev = data['prev_page_url'];
		var next = data['next_page_url'];
		var last = data['last_page'];

		var pagination = '<ul class="pagination">';

		if (data['current_page'] == 1 || data['total'] == 10) {
			first_enabled = false;
		}

		if (data['current_page'] == data['last_page']) {
			last_enabled = false;
		}

		pagination += '<li class="paginate_button first' + (first_enabled ? "" : " disabled") + '" id="report-table_first">\
			<a href="' + (first_enabled ? curr_loc + "1" : "#") + '" aria-controls="report-table" data-dt-idx="0" tabindex="0">First</a>\
		</li>\
		<li class="paginate_button previous' + (prev ? "" : " disabled") + '" id="report-table_previous">\
			<a href="' + (prev ? prev : "#") + '" aria-controls="report-table" data-dt-idx="1" tabindex="0">Previous</a>\
		</li>';

		pagination += '<li class="paginate_button next' + (next ? "" : " disabled") + '" id="report-table_next">\
			<a href="' + (next ? next : "#") + '" aria-controls="report-table" data-dt-idx="2" tabindex="0">Next</a>\
		</li>\
		<li class="paginate_button last' + (last_enabled ? "" : " disabled") + '" id="report-table_last">\
			<a href="' + (last_enabled ? curr_loc + last : "#") + '" aria-controls="report-table" data-dt-idx="3" tabindex="0">Last</a>\
		</li>';

		pagination += '</ul>';
		return pagination;
	}
});


$(window).on('hashchange', function() {
	if (window.location.hash && !filters_applied) {
		var page = window.location.hash.replace('#', '');
		if (page == Number.NaN || page <= 0) {
			return false;
		}
		else {
			refresh_grid_view(page);
		}
	}
});