$( document ).ready(function() {

	var current_page = 1;
	var module_name = '';

	refresh_list_view(current_page);

	$("#add-filter").on("click", function() {
		reset_filter_inputs();
		$('.list-column-filters').toggle();
	});

	$(".refresh-list-view").on("click", function() {
		current_page = 1;
		refresh_list_view(current_page);
	});

	// sort list view either ascending or descending
	$("#sort-list-order").on("click", function() {
		var order = $(this).data("value");
		var btn_html = '';
		var sort_order = '';

		if (order == "desc") {
			sort_order = 'asc';
			btn_html = '<i class="fa fa-arrow-up"></i>';
		}
		else {
			sort_order = 'desc';
			btn_html = '<i class="fa fa-arrow-down"></i>';
		}

		$(this).html(btn_html);
		$(this).attr("data-value", sort_order);
		$(this).data("value", sort_order);

		refresh_list_view(current_page);
	});

	// sort list view by column name
	$(".sort-list-by-name").on("click", function(e) {
		e.preventDefault();
		var sort_field = $(this).data("value");
		var field_label = $.trim($(this).html());

		$("#sort-field").attr("data-value", sort_field);
		$("#sort-field").data("value", sort_field);
		$("#sort-field").html(field_label);

		refresh_list_view(current_page);
	});

	// on row click show the record form view
	$(".list-view").on("click" , '.clickable_row', function(e) {
		if ($(e.target).closest('td').attr('data-field-name') != "row_check" && e.target.type != "checkbox") {
			window.location = $(this).data("href");
		}
	});

	// Check all checkboxes in list view on parent check
	$('body').on('change', '.list-view .list-header [type="checkbox"]', function(e) {
		e && e.preventDefault();
		var $table = $(e.target).closest('.list-view'), $checked = $(e.target).is(':checked');
		$('.list-view-items [type="checkbox"]', $table).prop('checked', $checked);
		toggle_action_button();
	});

	// toggle action button on list row check
	$('body').on('change', '.list-view .list-view-items [type="checkbox"]', function(e) {
		toggle_action_button();
	});

	$(".delete-selected").on("click", function() {
		remove_selected_row_data();
	});

	$(".remove-column-filters").on("click", function() {
		reset_filter_inputs();
		$(this).closest('.list-column-filters').hide();
	});

	$(".apply-column-filters").on("click", function() {
		var filter_container = $(this).closest('.list-column-filters');
		var column_name = $(filter_container).find('[name="column_name"]').val();
		var column_operator = $(filter_container).find('[name="column_operator"]').val();
		var column_value = $(filter_container).find('[name="column_value"]').val();

		if (column_name && column_operator) {
			var column_label = $(filter_container).find('[name="column_name"] option:selected').text();
			var tag_text = column_label + ' ' + column_operator + ' ' + (column_value || "Null");

			var filter_tag = '<div class="btn-group filter-tag" data-cn="' + column_name + '" data-co="' + column_operator + '" data-cv="' + column_value + '">\
				<button class="btn btn-white btn-xs" type="button">' + tag_text + '</button>\
				<button class="btn btn-white btn-xs remove-filter" type="button" title="Remove Filter">\
					<i class="fa fa-times"></i>\
				</button>\
			</div>';

			$('.list-active-filters').show();
			$('.list-active-filters').append(filter_tag);

			reset_filter_inputs();
			$(this).closest('.list-column-filters').hide();

			current_page = 1;
			refresh_list_view(current_page);
		}
		else {
			notify("Please select Column Name & Column Operator", "error");
		}
	});

	$('.list-column-filters').find('[name="column_name"]').on("change", function() {
		var column_name = $(this).find(":selected").val();
		var column_type = $(this).find(":selected").data("type");
		var filter_sec = $(this).closest('.list-column-filters');
		var value_container = $(filter_sec).find('.column-value-container');
		var new_input = '';

		if (column_type == "boolean") {
			new_input = '<select class="form-control" name="column_value">\
				<option value="1">Yes</option>\
				<option value="0">No</option>\
			</select>';
		}
		else if (column_type == "date") {
			new_input = '<div class="input-group">\
				<span class="input-group-addon">\
					<i class="fa fa-calendar"></i>\
				</span>\
				<input type="text" name="column_value" class="form-control date" autocomplete="off">\
			</div>';
		}
		else if (column_type == "datetime") {
			new_input = '<div class="input-group datetimepicker">\
				<span class="input-group-addon">\
					<i class="fa fa-calendar"></i>\
				</span>\
				<input type="text" name="column_value" class="form-control date" autocomplete="off">\
			</div>';
		}
		else {
			new_input = '<input type="text" name="column_value" class="form-control autocomplete" autocomplete="off" data-ac-module="' + module_name + '" data-ac-field="' + column_name + '" data-ac-unique="Yes">';
		}

		$(value_container).empty().append(new_input);

		if (column_type == "date") {
			enable_datepicker();
		}
		else if (column_type == "datetime") {
			enable_datetimepicker();
		}
		else if (column_type != "boolean") {
			enable_autocomplete();
		}
	});

	// remove filter tag and refresh list view
	$('body').on('click', '.filter-tag .remove-filter', function (e) {
		$(this).closest('.filter-tag').remove();
		refresh_list_view(current_page);
	});

	// get records when click on pagination links
	$('body').on('click', '.origin-pagination a', function (e) {
		e.preventDefault();

		if ($(this).attr('href') != "#" && $(this).attr('href').indexOf('page=') >= 0) {
			current_page = $(this).attr('href').split('page=')[1];
			refresh_list_view(current_page);
		}
	});

	// refresh table rows
	function refresh_list_view(page, delete_list) {
		$(".data-loader").show();
		var data = get_sorting_filters_data();

		if (delete_list) {
			data['delete_list'] = delete_list;
		}

		$.ajax({
			type: 'GET',
			url: app_route + '?page=' + page,
			data: data,
			dataType: 'json',
			success: function(data) {
				if (delete_list) {
					process_post_delete(data['data']);
				}
				else {
					var list_columns = data['columns'];
					var list_rows = data['rows']['data'];
					var link_field = data['module']['link_field'];
					module_name = data['module']['name'];
					var form_title = data['module']['form_title'];
					var number_start = data['rows']['from'];

					var list_table = $(".list-view").attr("data-module", module_name);
					var list_records = "";
					var form_link = app_route.replace("/list/", "/form/");

					if (list_rows.length > 0) {
						$.each(list_rows, function(index, row_data) {
							var record_link = form_link + '/' + row_data[link_field];

							list_records += '<tr class="clickable_row" data-href="' + record_link + '" data-id="' + row_data["id"] + '">';

							if (data['can_delete']) {
								list_records += '<td width="10%" data-field-name="row_check" class="list-checkbox">\
									<input type="checkbox" name="post[]" value="' + (index + 2) + '" id="check-' + (index + 2) + '">\
								</td>';
							}
							else {
								list_records += '<td class="text-center">' + (number_start + index) + '</td>';
							}

							$.each(list_columns, function(idx, column_name) {
								var field_value = row_data[column_name];

								if (!field_value && field_value != 0) {
									field_value = '';
								}

								if (column_name == form_title) {
									list_records += '<td data-field-name="' + column_name + '" class="link-field">\
										<a href="' + record_link + '">' + field_value + '</a>\
									</td>';
								}
								else {
									list_records += '<td data-field-name="' + column_name + '">' + field_value + '</td>';
								}
							});

							list_records += '</tr>';
						});
					}

					$(".data-loader").hide();
					$(list_table).find('.list-view-items').empty().append(list_records);
					toggle_action_button();
					$("#item-count").html(data['rows']['total']);
					$("#item-from").html(data['rows']['from']);
					$("#item-to").html(data['rows']['to']);
					beautify_list_view();

					$(".origin-pagination-content").empty().append(make_pagination(data['rows']));
				}
			},
			error: function(e) {
				notify(JSON.parse(e.responseText)['message'], "error");
				$(".data-loader").hide();
			}
		});
	}

	// show delete button if any record is selected or show new
	function toggle_action_button() {
		var list_items = $(".list-view").find(".list-view-items");
		var checked_length = $(list_items).find("input[type='checkbox']:checked").length;

		toggle_check_all_box(checked_length);

		if (checked_length > 0) {
			var total_records = $("#item-count").html();
			var selected_msg = checked_length + ' of ' + total_records + ' selected';
			$("body").find('.record-selected-count').html(selected_msg);
			$("body").find('.record-selected-count').show();
			$("body").find(".new-form").hide();
			$("body").find(".delete-selected").show();
		}
		else {
			$("body").find('.record-selected-count').html('');
			$("body").find('.record-selected-count').hide();
			$("body").find(".new-form").show();
			$("body").find(".delete-selected").hide();
		}
	}

	// delete all records based on rows checked
	function remove_selected_row_data() {
		var checked_rows = get_checked_rows();

		if (checked_rows.length > 0) {
			var modal_footer = '<button type="button" class="btn btn-sm" data-dismiss="modal">No</button>\
				<button type="button" class="btn btn-danger btn-sm" id="delete-records" data-loading-text="Deleting...">Yes</button>';
			msgbox("Sure you want to permanently delete selected records ?", modal_footer);
		}
		else {
			notify("Please select any record to delete", "error");
		}

		$("#delete-records").on("click", function() {
			var $btn = $(this).button("loading");
			refresh_list_view(current_page, checked_rows);
		});
	}

	// get all checked rows
	function get_checked_rows() {
		var checked_rows = [];
		var list_items = $(".list-view").find(".list-view-items");

		$.each($(list_items).find("input[type='checkbox']"), function(index, element) {
			if ($(element).is(":checked")) {
				checked_rows.push($(this).closest('.clickable_row').data('id'));
			}
		});

		return checked_rows;
	}

	// toggle check all checkbox
	function toggle_check_all_box(checked_length) {
		var list_items = $(".list-view").find(".list-view-items");
		var total_check_boxes = $(list_items).find("input[type='checkbox']").length;

		if (!checked_length) {
			var checked_length = $(list_items).find("input[type='checkbox']:checked").length;
		}

		if (checked_length && checked_length == total_check_boxes) {
			$('#check-all').prop('checked', true);
		}
		else {
			$('#check-all').prop('checked', false);
		}
	}

	// prepare all filters and sorting data
	function get_sorting_filters_data() {
		var data = {};
		var filters = [];
		var sort_order = $("#sort-list-order").data("value");
		var sort_field = $("#sort-field").data("value");

		data['sorting'] = {'field': sort_field, 'order': sort_order};

		var active_filters = $('body').find('.list-active-filters .filter-tag');

		if (active_filters.length) {
			$.each($(active_filters), function(idx, filter) {
				var column_name = $(filter).data('cn');
				var column_operator = $(filter).data('co');
				var column_value = $(filter).data('cv');

				if (column_name && column_operator) {
					current_filters = {
						'column_name': column_name,
						'column_operator': column_operator,
						'column_value': column_value
					};

					filters.push(current_filters);
				}
			});

			data['filters'] = filters;
		}

		return data;
	}

	// show error or success notification based on delete result
	function process_post_delete(result) {
		$("#message-box").modal('hide');
		var error_data = [];

		$.each(result, function(idx, res) {
			if (!res['success']) {
				error_data.push(res['msg']);
			}
		});

		if (error_data && error_data.length) {
			$.each(error_data, function(idx, err_msg) {
				notify(err_msg, "error");
			});
		}
		else {
			notify("Records deleted successfully", "success");
		}

		if (result.length == error_data.length) {
			$(".data-loader").hide();
		}
		else {
			refresh_list_view(current_page);
		}
	}

	// reset all input, select, etc. elements to default
	function reset_filter_inputs() {
		var filter_sec = $('body').find('.list-column-filters');
		var column_name = $(filter_sec).find('[name="column_name"] option:first').val();
		var column_operator = $(filter_sec).find('[name="column_operator"] option:first').val();

		$(filter_sec).find('[name="column_name"]').val(column_name);
		$(filter_sec).find('[name="column_operator"]').val(column_operator);
		$('.list-column-filters').find('[name="column_name"]').trigger("change");
	}

	$(window).on('hashchange', function() {
		if (window.location.hash) {
			var page = window.location.hash.replace('#', '');
			if (page == Number.NaN || page <= 0) {
				return false;
			}
			else {
				refresh_list_view(page);
			}
		}
	});
});