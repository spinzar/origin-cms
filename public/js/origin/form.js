var mandatory_fields = get_mandatory_fields();

$( document ).ready(function() {
	var disable_fields = false;

	// if form has been changed then enable form save button
	$('form#' + origin.slug).on('change input', 'input, select, textarea', function() {
		change_doc();
	});

	// show images files
	$('form#' + origin.slug).on("change", "input[type='file']", function() {
		if ($(this).val()) {
			read_image(this);
		}
	});

	// shows msgbox to delete the record permanently
	$("#delete").on("click", function() {
		var current_url = app_route;
		var link_field_value = current_url.split('/').pop();
		var delete_path = current_url.replace("/" + link_field_value, "/delete/" + link_field_value);

		var footer = '<span class="pull-right">\
			<button type="button" class="btn btn-sm" data-dismiss="modal">No</button>\
			<a class="btn btn-danger btn-sm" href="' + delete_path + '" id="yes" name="yes">\
				Delete\
			</a>\
		</span>';

		msgbox("Sure you want to delete this record permanently?", footer);
	});

	// bind save and reset button to form
	$("#save_form").on('click', function() {
		$("#" + origin.slug).submit();
	});

	set_doc_data();
	initialize_mandatory_fields();
	enable_autocomplete();

	var form_id = $('[name="id"]').val();

	if (form_id) {
		if (!origin.permissions.update) {
			disable_fields = true;
		}
	} else {
		if (!origin.permissions.create) {
			disable_fields = true;
		}
	}

	if (origin.module == "Settings") {
		disable_fields = false;
	}

	if (disable_fields) {
		make_fields_readable();
	}

	// validate forms for mandatory fields
	$('form#' + origin.slug).submit(function(e) {
		var validated = true;

		$.each(mandatory_fields, function(index, field) {
			if (!trim($(field).val())) {
				msg = "Please Enter " + $(field).attr("name").replace("_", " ").toProperCase();
				notify(msg, "error");
				e.preventDefault();
				validated = false;
				$(field).focus();
				return false;
			}
		});

		if (validated) {
			// checkbox toggle value
			$.each($('form#' + origin.slug).find("input[type='checkbox']"), function(idx, checkbox) {
				if (this.checked) {
					$(this).val("1");
					$(this).closest('.checkbox-value').prop("disabled", true);
				}
				else {
					$(this).val("0");
				}
			});

			$(".data-loader-full").show();
		}
	});
});

// calls required functions for changing doc state
function change_doc() {
	origin.changed = true;
	initialize_mandatory_fields();
	remove_mandatory_highlight(mandatory_fields);
	enable_save_button();
}

// get all mandatory fields and highlight
function initialize_mandatory_fields () {
	mandatory_fields = get_mandatory_fields();
	highlight_mandatory_fields(mandatory_fields);
}


// fetch all mandatory fields inside a form
function get_mandatory_fields() {
	var mandatory_fields = [];
	$form_elements = $("form").find("input, select, textarea");

	$.each($form_elements, function(index, element) {
		if ($(this).data("mandatory") == "yes") {
			mandatory_fields.push($(element)[0]);
		}
	});

	return mandatory_fields;
}

// show error label and input to all mandatory fields
function highlight_mandatory_fields(mandatory_fields) {
	if (!mandatory_fields) {
		mandatory_fields = get_mandatory_fields();
	}

	$.each(mandatory_fields, function(index, field) {
		if ($.trim($(this).val()) == "") {
			$(field).closest(".form-group").addClass("has-error");
			$(field).addClass("error");
		}
	});
}

// remove highlight if data is entered on mandatory fields
function remove_mandatory_highlight(mandatory_fields) {
	$.each(mandatory_fields, function() {
		$parent_div = $(this).closest(".form-group");
		if ($.trim($(this).val())) {
			$($parent_div).removeClass("has-error");
			$(this).removeClass("error");
		}
		else {
			$($parent_div).addClass("has-error");
			$(this).addClass("error");
		}
	});
}

// make all fields readable
function make_fields_readable() {
	$form_elements = $("form").find("input, select, textarea");

	$.each($form_elements, function(index, element) {
		var ele_type = $(element).attr("type");

		if (!["hidden", "file"].contains(ele_type)) {
			var new_control = '';

			if (ele_type == "checkbox") {
				if ($(element).is(":checked")) {
					new_control = '<i class="fa fa-check-square-o"></i>';
				}
				else {
					new_control = '<i class="fa fa-square-o"></i>';
				}
			}
			else {
				var ele_val = $(element).val();

				if ($(element).attr("name") == "is_active") {
					ele_val = parseInt(ele_val) ? "Yes" : "No";
				}

				new_control = '<p class="form-control-static origin-static">' + ele_val + '</p>';
			}

			$(new_control).insertBefore($(element));
		}

		if ($(element).attr("type") == "file") {
			$(element).closest('.btn').remove();
		}

		$(element).remove();
	});

	// hide remove row & add new row buttons from child tables
	$.each($('table'), function(idx, tbl) {
		$(tbl).find('th.remove').remove();
		$(tbl).find('.remove-row').closest('td').remove();
		$(tbl).find('.new-row').closest('tr').remove();
	});
}

// enable save button
function enable_save_button() {
	form_changed = true;
	$("#save_form").removeClass("disabled");
	$("#save_form").prop("disabled", false);
	$("#form-stats > i").removeClass("text-green").addClass("text-yellow");
	$("#form-status").html('Not Saved');
}

// show image files locally with uploading
function read_image(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var avatar_box = '<img src="' + e.target.result + '">';
			$(input).closest('.media').find('.avatar-box').empty().append(avatar_box);
		}

		reader.readAsDataURL(input.files[0]);
	}
}

// set data to form
function set_doc_data() {
	if (typeof origin.data != 'undefined' && origin.data) {
		$.each(origin.data, function(table_name, table_data) {
			$.each(table_data, function(field_name, value) {
				var ignore_fields = ['avatar', 'updated_at', 'owner', 'last_updated_by'];

				if (typeof value === 'string' || typeof value === 'number') {
					if (typeof value === 'string' && (value.isDate() || value.isDateTime())) {
						$('[name="' + field_name + '"]').attr("data-field_value", value);

						if (value.split(" ").length > 1) {
							value = moment(value).format('DD-MM-YYYY hh:mm A');
						}
						else {
							value = moment(value).format('DD-MM-YYYY');
						}
					}
					if (ignore_fields.indexOf(field_name) == -1) {
						if ($('[name="' + field_name + '"]')) {
							$('[name="' + field_name + '"]').val(value);
						}
					}
				}
				else if (typeof value === 'object' && value) {
					add_new_rows(table_name, table_data);
					return false;
				}
			});
		});

		// set text editor value if found
		$(".text-editor, .text-editor-advanced").each(function(idx, field) {
			$(field).trumbowyg('html', $(field).val());
		});

		if (!origin.permissions.update) {
			$("body").find('.text-editor, .text-editor-advanced').trumbowyg('disable');
			$("body").find('.text-editor, .text-editor-advanced').remove();
		}
	}
}

// create custom button
window.origin.make = {
	button: function (button_config) {
		var button_text = button_config['text'];
		var button_name = button_config['name'];

		// get button class from given config or assign default classs
		if(typeof button_config['class'] != 'undefined' && button_config['class']) {
			var button_class = "btn " + button_config['class'];
		}
		else {
			var button_class = "btn btn-primary";
		}

		// create button element with it's given config
		var element = document.createElement("button");
		element.setAttribute("type", "button");
		element.setAttribute("name", button_name);
		element.setAttribute("id", button_name);
		element.setAttribute("class", button_class);

		// set button loading text if given
		if(typeof button_config['loading_text'] != 'undefined' && button_config['loading_text']) {
			element.setAttribute("data-loading-text", button_config['loading_text']);
		}
		element.appendChild(document.createTextNode(button_text));

		// append button on form title section
		$(".ibox-tools").prepend(element);

		// bind on click method to the dynamically created button if passed in button config
		if (typeof button_config['on_click'] != 'undefined' && button_config['on_click']) {
			$("#" + button_name).on("click", function() {
				button_config['on_click']();
			});
		}
	}
};