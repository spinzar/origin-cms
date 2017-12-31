$( document ).ready(function() {

	beautify_list_view();
	enable_autocomplete();

	// refresh the list view
	$("#refresh_list").on("click", function() {
		refresh_table_list();
		$("#search_text").val("");
	});

	// on row click show the record form view
	$("table.list-view").on("click" , '.clickable_row', function(e) {
		if ($(e.target).closest('td').attr('data-field-name') != "row_check" && e.target.type != "checkbox") {
			window.location = $(this).data("href");
		}
	});


	// Check all checkboxes in list view on parent check
	$(document).on('change', 'table thead [type="checkbox"]', function(e) {
		e && e.preventDefault();
		var $table = $(e.target).closest('table'), $checked = $(e.target).is(':checked');
		$('tbody [type="checkbox"]', $table).prop('checked', $checked);
		toggle_action_button();
	});


	// toggle action button on list row check
	$(document).on('change', 'table tbody [type="checkbox"]', function(e) {
		toggle_action_button();
	});


	// refresh the data list based on search criteria
	$("#search").on("click", function() {
		if (trim($("#search_text").val())) {
			refresh_table_list($("#search_text").val(), $("#search_text").data("target-field"));
		}
		else {
			notify("Please enter any text in search box", "error");
			$('#message-box').on('hidden.bs.modal', function (e) {
				$("#search_text").val("");
				$("#search_text").focus();
			});
		}
	});


	$(".delete-selected").on("click", function() {
		remove_selected_row_data();
	});


	// set pagination attributes
	$(".pagination").attr("class", "pagination pagination-small m-t-none m-b-none");
});


// refresh table list
function refresh_table_list(search) {
	var data = {
		'module_name': table,
		'search': search ? search : "",
		'search_field': search_field ? search_field : ""
	}

	$.ajax({
		type: 'GET',
		url: app_route,
		data: data,
		dataType: 'json',
		success: function(data) {
			var list_columns = data['columns'];
			var list_rows = data['rows'];
			var list_title = data['title'];
			var list_link_field = data['link_field'];
			var list_module = data['module'];
			var form_title = data['form_title'];

			var list_table = $("table").attr("data-module", list_module);
			var list_records = "";
			var form_link = app_route.replace("/list/", "/form/");

			if (list_rows.length > 0) {
				$.each(list_rows, function(index, row_data) {
					list_records += '<tr class="clickable_row" data-href="' + form_link + '/' + list_rows[index][list_link_field] + '">';
					list_records += '<td data-field-name="row_check" class="list-checkbox">\
						<div class="checkbox">\
							<input type="checkbox" name="post[]" value="' + (index + 2) + '" id="check-' + (index + 2) + '">\
							<label for="check-' + (index + 2) + '">\
						</div>\
					</td>';

					$.each(list_columns, function(index, column_name) {
						var field_value = row_data[column_name];

						if (column_name == form_title) {
							list_records += '<td data-field-name="' + column_name + '" class="link-field">\
								<a href="' + form_link + '/' + list_rows[index][list_link_field] + '">' + field_value + '</a>\
							</td>';
						}
						else {
							list_records += '<td data-field-name="' + column_name + '">' + field_value + '</td>';
						}

					});
					list_records += '</tr>';
				});
			}

			$(list_table).find('tbody').empty().append(list_records);
			beautify_list_view();
		}
	});
}


// show delete button if any record is selected or show new
function toggle_action_button() {
	var checked_length = $("table.list-view > tbody > tr").find("input[type='checkbox']:checked").length;

	toggle_check_all_box(checked_length);

	if (checked_length > 0) {
		$("body").find(".new-form").hide();
		$("body").find(".delete-selected").show();
	}
	else {
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

		$.ajax({
			type: 'GET',
			url: app_route,
			data: { "delete_list": checked_rows },
			success: function(data) {
				$btn.button("reset");
				$("#message-box").modal('hide');
				update_record_count();

				$.each(checked_rows, function(index, row) {
					$('tr[data-href="' + row + '"]').remove();
				});

				toggle_action_button();
				notify("Records deleted successfully", "success");

				if ($("table.list-view > tbody > tr").length == 0) {
					row = '<tr>\
						<td style="text-align:center; padding:10px; border-bottom:none;" colspan="' + $("table.list-view > thead > tr > th").length + '">\
							<div class="h4"><strong>No Data</strong></div>\
						</td>\
					</tr>';
					$("table.list-view").find('tbody').append(row);
				}
			},
			error: function(data) {
				$btn.button("reset");
				$("#message-box").modal('hide');
				notify("Some problem occured. Please try again", "error");
			}
		});
	});
}


// get all checked rows
function get_checked_rows() {
	var checked_rows = [];
	$.each($("table.list-view > tbody > tr").find("input[type='checkbox']"), function(index, element) {
		if ($(element).is(":checked")) {
			checked_rows.push($(this).closest('tr.clickable_row').data('href'));
		}
	});

	return checked_rows;
}


// toggle check all checkbox
function toggle_check_all_box(checked_length) {
	var total_check_boxes = $("table.list-view > tbody > tr").find("input[type='checkbox']").length;
	if (!checked_length) {
		var checked_length = $("table.list-view > tbody > tr").find("input[type='checkbox']:checked").length;
	}

	if (checked_length && checked_length == total_check_boxes) {
		$('#check-all').prop('checked', true);
	}
	else {
		$('#check-all').prop('checked', false);
	}
}


// update record count after row actions
function update_record_count() {
	var checked_length = $("table.list-view > tbody > tr").find("input[type='checkbox']:checked").length;
	var total_records = parseInt($("#row-count").html());

	$("#row-count").html(total_records - checked_length);
}