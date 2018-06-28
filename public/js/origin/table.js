$( document ).ready(function() {
	$(".new-row").on("click", function() {
		var table = $("#" + $(this).data("target"));
		add_new_row(table);
		$(table).find("tr:last > td:eq(3) > input").focus();
	});

	// remove row
	$("table").on("click" , '.remove-row', function() {
		var target = $(this).closest("table").attr("id");
		var tbody = $(this).closest("table").find("tbody");
		var table = $(this).closest("table");

		if ($('[name="id"]').val()) {
			// if ID is present, means the record already exists in db
			// At that time if row is deleted then set action as delete and hide the row
			$(this).closest("tr.table_record").find("td.action").find("input").val("delete");
			$(this).closest("tr.table_record").hide();
		}
		else {
			// if ID is not present then simply remove row which will be independent of action
			$(this).closest("tr").remove();
		}

		// show total no of row badge
		show_total_badge(target);

		if ($(tbody).find("tr:visible").length) {
			maintain_idx(tbody);
		}
		else {
			show_empty_row(table);
		}

		enable_save_button();
	});

	// make row editable
	$("table").on("click", '.table_record', function() {
		$(this).find("input").removeClass("simple-box");
	});

	// set action update if input is changed
	$("table > tbody > tr").on("change", 'input, select, textarea', function() {
		if ($('[name="id"]').val()) {
			$(this).closest("tr").find("td.action > input").val("update");
		}

		if ($(this).attr("type") == "checkbox") {
			if (this.checked) {
				$(this).parent().find('.checkbox-value').val('1');
			}
			else {
				$(this).parent().find('.checkbox-value').val('0');
			}
		}
	});
});

function add_new_row(table, idx, action) {
	var thead = $(table).find("thead");
	var tbody = $(table).find("tbody");

	// remove empty row
	if ($(tbody).find("tr").hasClass("odd")) {
		$(tbody).empty();
	}

	// add row html
	add_row(table, idx ? idx : $(tbody).find("tr").length + 1, action);
	show_total_badge($("." + $(table).attr("id")).find(".new-row").data("target"));
}

function add_row(table, idx, action) {
	var table_name = $(table).data("table");
	var thead = $(table).find("thead");
	var tbody = $(table).find("tbody");
	var row_action = action ? action : "create";
	var field_types = [];

	var row = '<tr class="table_record">';

	$.each($(thead).find("tr > th"), function(index, heads) {
		if ($(heads).hasClass('sr-no') && index == 0) {
			row += '<td class="text-center" style="vertical-align: middle;"></td>';
		}
		else if ($(heads).hasClass('remove')) {
			row += '<td class="text-center" data-idx="' + idx + '">\
				<button type="button" class="btn btn-danger btn-xs remove-row">\
					<i class="fa fa-times"></i>\
				</button>\
			</td>';
		}
		else if ($(heads).hasClass('action')) {
			row += '<td class="action" style="display: none;">\
				<input type="text" class="form-control input-sm" name="' + table_name + '[' + (idx - 1) + '][action]" value="' + row_action + '">\
			</td>';

			$(this).find('input[name="' + table_name + '[' + (idx - 1) + '][action]"]').val(row_action);
		}
		else if ($(heads).hasClass('row-id')) {
			row += '<td class="row-id" style="display: none;">\
				<input type="text" class="form-control input-sm" name="' + table_name + '[' + (idx - 1) + '][id]">\
			</td>';
		}
		else {
			var field_type = $(heads).data("field-type");
			var field_name = $(heads).data("field-name");
			var target_module = $(heads).data("ac-module");
			var target_field = $(heads).data("ac-field");
			var readonly = ($(heads).data("readonly") == "yes") ? "readonly" : "";
			var hidden = ($(heads).data("hidden") == "yes") ? "style='display: none;'" : "";

			field_types.push(field_type);

			if (field_type == "link") {
				row += '<td data-field-type="link">\
					<input type="text" class="form-control input-sm autocomplete" \
					name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" \
					autocomplete="off" data-ac-module="' + target_module + '" data-ac-field="' + target_field + '"' + readonly + '>\
				</td>';
			}
			else if (field_type == "image") {
				row += '<td data-field-type="image">\
					<div class="col-md-12 media">\
						<div class="pull-left text-center avatar-box">\
							<i class="fa fa-picture-o inline fa-2x avatar"></i>\
						</div>\
						<div class="media-body text-left">\
							<label title="Upload image file" class="btn btn-primary btn-xs">\
								<input type="file" accept="image/*" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" class="hide">\
								Change\
							</label>\
						</div>\
					</div>\
				</td>';
			}
			else if (field_type == "select") {
				row += '<td data-field-type="select">\
					<select class="form-control input-sm" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']">';

				$.each($(heads).data("options").split(","), function(index, option) {
					row += '<option value="' + option + '">' + option + '</option>';
				});

				row += '</select></td>';
			}
			else if (field_type == "checkbox") {
				row += '<td data-field-type="checkbox"' + hidden + ' class="text-center" style="vertical-align: middle;">\
					<input type="hidden" class="checkbox-value" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" value="0">\
					<input type="checkbox" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" ' + readonly + '>\
				</td>';
			}
			else if (field_type == "date") {
				row += '<td data-field-type="date">\
					<div class="input-group date" data-autoclose="true">\
						<span class="input-group-addon">\
							<i class="fa fa-calendar"></i>\
						</span>\
						<input type="text" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" class="form-control input-sm" autocomplete="off">\
					</div>\
				</td>';
			}
			else if (field_type == "text" || field_type == "money") {
				if (target_module && target_field) {
					row += '<td data-field-type="' + field_type + '"' + hidden + '>\
						<input type="text" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" \
						class="form-control input-sm" data-ac-module="' + target_module + '" data-ac-field="' + target_field + '" autocomplete="off"' + readonly + '>\
					</td>';
				}
				else {
					row += '<td data-field-type="' + field_type + '"' + hidden + '>\
						<input type="text" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" \
						class="form-control input-sm" autocomplete="off"' + readonly + '>\
					</td>';
				}
			}
			else if (field_type == "textarea") {
				row += '<td data-field-type="textarea">\
					<textarea rows="5" cols="8" name="' + table_name + '[' + (idx - 1) + '][' + field_name + ']" \
					class="form-control input-sm" autocomplete="off"></textarea>\
				</td>';
			}
		}
	});
	row += '</tr>';

	$(tbody).append(row);
	maintain_idx(tbody);
	enable_autocomplete();
	set_pickers_in_table(table_name, table, field_types);
}

function maintain_idx(tbody) {
	var idx = 1;
	$.each($(tbody).find("tr"), function(index, row) {
		if ($(row).is(":visible")) {
			$(row).attr("idx", idx);
			$(row).find("td:first").html(idx);
			idx++;
		}
	});
}

function show_empty_row(table) {
	var colspan = $(table).find("thead > tr > th").length;
	var empty_row = '<tr class="odd">\
		<td valign="middle" align="center" colspan="' + colspan + '">Empty</td>\
	</tr>';
	$(table).find("tbody").append(empty_row);
}

function show_total_badge(target) {
	var total_rows = $("." + target).find("table#" + target).find("tbody > tr:visible").length;
	$("." + target).find("#total_badge").html(total_rows);
}

// add multiple rows for table at the time of loading
function add_new_rows(table_name, records) {
	var table = $('table[data-table="' + table_name + '"]');
	var thead = $(table).find("thead");
	var tbody = $(table).find("tbody");
	var field_types = [];
	var rows = '';

	// remove empty row
	if ($(tbody).find("tr").hasClass("odd")) {
		$(tbody).empty();
	}

	var tbody_len = $(tbody).find("tr").length;

	$.each(records, function(idx, value) {
		if (tbody_len) {
			idx = tbody_len;
		}

		rows += '<tr class="table_record">';

		$.each($(thead).find("tr > th"), function(index, heads) {
			var field_type = $(heads).data("field-type");
			var field_name = $(heads).data("field-name");
			var target_module = $(heads).data("ac-module");
			var target_field = $(heads).data("ac-field");
			var readonly = ($(heads).data("readonly") == "yes") ? "readonly" : "";
			var hidden = ($(heads).data("hidden") == "yes") ? "style='display: none;'" : "";
			field_types.push(field_type);

			// get value for the field
			if (value[field_name] && typeof value[field_name] === 'string' && (value[field_name].isDate() || value[field_name].isDateTime())) {
				if (value[field_name].split(" ").length > 1) {
					field_value = moment(value[field_name]).format('DD-MM-YYYY hh:mm A');
				}
				else {
					field_value = moment(value[field_name]).format('DD-MM-YYYY');
				}
			}
			else if (value[field_name] && typeof value[field_name] === 'string' && value[field_name].isTime()) {
				field_value = moment(value[field_name], ["HH:mm:ss"]).format('HH:mm');
			}
			else {
				field_value = value[field_name] || '';
			}

			// set default table values
			if ($(heads).hasClass('sr-no')) {
				rows += '<td class="text-center" style="vertical-align: middle;">' + (idx + 1) + '</td>';
			}
			else if ($(heads).hasClass('remove')) {
				rows += '<td class="text-center" data-idx="' + (idx + 1) + '">\
					<button type="button" class="btn btn-danger btn-xs remove-row">\
						<i class="fa fa-times"></i>\
					</button>\
				</td>';
			}
			else if ($(heads).hasClass('action')) {
				// while showing data
				if (value["id"]) {
					var action = "none";
				}
				// while copying data
				else {
					var action = "create";
				}

				rows += '<td class="action" style="display: none;">\
					<input type="text" class="form-control input-sm" name="' + table_name + '[' + idx + '][action]" value="' + action + '">\
				</td>';
			}
			else if ($(heads).hasClass("row-id")) {
				rows += '<td class="row-id" style="display: none;">\
					<input type="text" class="form-control input-sm" name="' + table_name + '[' + idx + '][id]" value="' + value["id"] + '">\
				</td>';
			}
			// set field value
			else {
				if (field_type == "link") {
					rows += '<td data-field-type="link">\
						<input type="text" class="form-control input-sm autocomplete" \
						name="' + table_name + '[' + idx + '][' + field_name + ']" \
						autocomplete="off" data-ac-module="' + target_module + '" data-ac-field="' + target_field + '"' + readonly + ' value="' + field_value + '">\
					</td>';
				}
				else if (field_type == "image") {
					rows += '<td data-field-type="image">\
						<div class="col-md-12 media">\
							<div class="pull-left text-center avatar-box">';

					if (value['avatar']) {
						rows += '<img src="' + value["avatar"] + '" alt="Image">';
					}
					else {
						rows += '<i class="fa fa-picture-o inline fa-2x avatar"></i>';
					}

					rows += '</div>\
							<div class="media-body text-left">\
								<label title="Upload image file" class="btn btn-primary btn-xs">\
									<input type="file" accept="image/*" name="' + table_name + '[' + idx + '][' + field_name + ']" class="hide">\
									Change\
								</label>\
							</div>\
						</div>\
					</td>';
				}
				else if (field_type == "select") {
					rows += '<td data-field-type="select">\
						<select class="form-control input-sm" name="' + table_name + '[' + idx + '][' + field_name + ']">';

					$.each($(heads).data("options").split(","), function(index, option) {
						if (option == value[field_name]) {
							rows += '<option value="' + option + '" default selected>' + option + '</option>';
						}
						else {
							rows += '<option value="' + option + '">' + option + '</option>';
						}
					});

					rows += '</select></td>';
				}
				else if (field_type == "checkbox") {
					rows += '<td data-field-type="checkbox"' + hidden + ' class="text-center" style="vertical-align: middle;">\
						<input type="hidden" class="checkbox-value" name="' + table_name + '[' + idx + '][' + field_name + ']" ' + readonly + ' value="' + (parseInt(field_value) ? 1 : 0) + '">\
						<input type="checkbox" name="' + table_name + '[' + idx + '][' + field_name + ']" ' + readonly + (parseInt(field_value) ? " checked" : "") + '>\
					</td>';
				}
				else if (field_type == "date") {
					rows += '<td data-field-type="date">\
						<div class="input-group date" data-autoclose="true">\
							<span class="input-group-addon">\
								<i class="fa fa-calendar"></i>\
							</span>\
							<input type="text" name="' + table_name + '[' + idx + '][' + field_name + ']" class="form-control input-sm" autocomplete="off" value="' + field_value + '">\
						</div>\
					</td>';
				}
				else if (field_type == "text" || field_type == "money") {
					if (target_module && target_field) {
						rows += '<td data-field-type="' + field_type + '"' + hidden + '>\
							<input type="text" name="' + table_name + '[' + idx + '][' + field_name + ']" \
							class="form-control input-sm" data-ac-module="' + target_module + '" data-ac-field="' + target_field + '" autocomplete="off"' + readonly + ' value="' + field_value + '">\
						</td>';
					}
					else {
						rows += '<td data-field-type="' + field_type + '"' + hidden + '>\
							<input type="text" name="' + table_name + '[' + idx + '][' + field_name + ']" \
							class="form-control input-sm" autocomplete="off"' + readonly + ' value="' + field_value + '">\
						</td>';
					}
				}
				else if (field_type == "textarea") {
					rows += '<td data-field-type="textarea">\
						<textarea rows="5" cols="8" name="' + table_name + '[' + idx + '][' + field_name + ']" \
						class="form-control input-sm" autocomplete="off">' + field_value + '</textarea>\
					</td>';
				}
			}
		});

		rows += '</tr>';

		if (tbody_len) {
			tbody_len++;
		}
	});

	$(tbody).append(rows);
	enable_autocomplete();
	set_pickers_in_table(table_name, table, field_types);
}

// set datepicker, etc in child table
function set_pickers_in_table(table_name, table, field_types) {
	// set date field inside table elements
	if (field_types.contains("date")) {
		$.each($("table > tbody > tr").find(".date"), function(idx, element) {
			$(element).datepicker({
				format: 'dd-mm-yyyy',
				todayBtn: "linked",
				keyboardNavigation: false,
				forceParse: false,
				autoclose: true
			}).on('changeDate', function(ev) {
				if (typeof origin.data[table_name] !== "undefined") {
					var doc_records = origin.data[table_name].length;
				}
				else {
					var doc_records = 0;
				}

				var tab_records = $(table).find("tbody > tr").length;

				if ($.trim($('body').find('[name="id"]').val()) && doc_records == tab_records) {
					$(element).closest("tr").find("td.action > input").val("update");
				}

				if (typeof change_doc === "function") {
					change_doc();
				}
			});
		});
	}
}