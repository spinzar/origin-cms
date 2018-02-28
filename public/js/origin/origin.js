// convert string to proper case
String.prototype.toProperCase = function () {
	return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// convert string to snake case
String.prototype.toSnakeCase = function () {
	return this.replace(/(.)([A-Z])/g, "$1_$2").toLowerCase();
};

// check if string is a valid date
String.prototype.isDate = function () {
	var dateFormat;

	if (toString.call(this) === '[object Date]') {
		return true;
	}
	if (typeof this.replace === 'function') {
		this.replace(/^\s+|\s+$/gm, '');
	}

	dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;

	if (dateFormat.test(this)) {
		return !!new Date(this).getTime();
	}

	return false;
};

// check if string is a time
String.prototype.isTime = function () {
	var isValid = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test(this);
	return isValid;
};

// check if string is a time
String.prototype.isDateTime = function () {
	var date = this.split(" ");

	if (date[0].isDate() && date[1].isTime()) {
		return true;
	}

	return false;
};

// check if the string is a url/link
String.prototype.isURL = function() {
	var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	return pattern.test(this);
}

// Prototyping for getting month long name and short name
Date.prototype.getMonthName = function(lang) {
	lang = lang && (lang in Date.locale) ? lang : 'en';
	return Date.locale[lang].month_names[this.getMonth()];
};

Date.prototype.getMonthNameShort = function(lang) {
	lang = lang && (lang in Date.locale) ? lang : 'en';
	return Date.locale[lang].month_names_short[this.getMonth()];
};

Date.locale = {
	en: {
		month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	}
};

// check if array contains element
Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}

// get random element from array
Array.prototype.random = function () {
	return this[Math.floor((Math.random()*this.length))];
}

// get object from localstorage
Storage.prototype.getObject = function(key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
}

// set object in localstorage
Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
}

// set common global variables
var app_route = window.location.href;
var base_url = $("body").attr("data-base-url");
var table = "/" + app_route.split("/").pop(-1);

// Setup ajax for making csrf token used by laravel
$(function() {
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
});

$(function() {
	$(window).scroll(sticky_relocate);
	sticky_relocate();
});

$(document).ready(function() {
	// set body data url
	$("body").attr("data-url", app_route);

	// highlight text
	$("#top-search").on("input change", function() {
		$('body').removeHighlight();
		$('body').highlight($(this).val());
	});

	// back to top
	var amountScrolled = 300;
	$(window).scroll(function() {
		if ($(window).scrollTop() > amountScrolled) {
			$('a.back-to-top').fadeIn('slow');
		}
		else {
			$('a.back-to-top').fadeOut('slow');
		}
	});

	$('a.back-to-top').click(function() {
		$('body, html').animate({
			scrollTop: 0
		}, 400);
		return false;
	});

	// toggle breadcrumb
	var breadcrumb_ignore_list = ['/app', '/login', '/password'];
	if ((breadcrumb_ignore_list.indexOf(app_route) >= 0) || app_route.split("/")[1] == "list") {
		if ($(".navbar-brand").length > 1) {
			$(".navbar-brand:last").remove();
		}
	}
	else {
		var module_name = app_route.split("/")[2];
		var breadcrumb = '<a class="navbar-brand" href="/list/' + module_name + '" style="font-size: 22px;">' + module_name.replace(/_/g, " ").toProperCase() + ' List</a>';
		$(".navbar-brand").addClass("hidden-xs hidden-sm");
		$(breadcrumb).insertAfter(".navbar-brand");
	}

	// toggle vertical nav active
	$.each($(".treeview"), function(index, navbar) {
		if ($(navbar).find('a').attr('href') == window.location.href) {
			$(navbar).addClass('active');
		}
		else {
			$(navbar).removeClass('active');
		}
	});

	enable_autocomplete();
	enable_datepicker();
	enable_datetimepicker();
	enable_text_editor();
	enable_advanced_text_editor();

	// allow only numbers to text box
	$('body').on('input change', '.numbers-only', function() {
		this.value = this.value.replace(/[^0-9\.]/g,'');
	});
});

// Autocomplete
function enable_autocomplete() {
	var autocomplete = $('.autocomplete');

	$.each(autocomplete, function(index, field) {
		var data_module = $(field).data("ac-module");
		var data_field = $(field).data("ac-field");
		var data_image = $(field).data("ac-image") ? $(field).data("ac-image") : "0";
		var unique = ($(field).data("ac-unique") == "Yes") ? true : false;
		var module_fields = {};

		if (unique) {
			module_fields[data_module] = [data_field];
		}
		else {
			$.each($("body").find('input[data-ac-module="' + data_module + '"]'), function(index, element) {
				if (module_fields[data_module]) {
					module_fields[data_module].push($(element).data("ac-field"));
				}
				else {
					module_fields[data_module] = [$(element).data("ac-field")];
				}
			});
		}

		if (data_image && data_image != "0") {
			module_fields[data_module].push(data_image);
		}

		$(this).autocomplete({
			source: function(request, response) {
				$.ajax({
					url: base_url + '/get_auto_complete',
					dataType: "json",
					data: {
						module: data_module,
						field: data_field,
						fetch_fields: module_fields[data_module],
						query: request.term,
						unique: unique,
						image_field: data_image
					},
					success: function(data) {
						if (data.length) {
							var label_field = data_field.split("+");

							response($.map(data, function (item) {
								var label_value = '';

								if (label_field.length > 1) {
									$.each(label_field, function(l_idx, field_name) {
										label_value += item[field_name] + " ";
									});
								}
								else {
									label_value = item[label_field[0]];
								}

								item['label'] = trim(label_value);
								return item;
							}));
						}
						else {
							if (request.term) {
								var label_value = 'No matches found';
							}
							else {
								var label_value = 'No Data';
							}

							response([{label: label_value, val: request.term}]);
						}
					},
					error: function(e) {
						notify('Some error occured. Please try again...!!!', 'error');
					}
				});
			},
			minLength: 0,
			select: function(event, ui) {
				$.each(ui.item, function(key, value) {
					var input_field = $('body').find('input[data-ac-field="' + key + '"][data-ac-module="' + data_module + '"]');

					if (input_field.length > 1) {
						// when autocomplete for same module is present in parent and child
						if ($(field).closest('tr').find('input[data-ac-field="' + key + '"][data-ac-module="' + data_module + '"]').length) {
							$(field).closest('tr').find('input[data-ac-field="' + key + '"][data-ac-module="' + data_module + '"]').val(value).trigger('change');
						}
						else {
							$(input_field).val(value).trigger('change');
						}
					}
					else {
						$(input_field).val(value).trigger('change');
					}

					if (typeof initialize_mandatory_fields === 'function') { 
						initialize_mandatory_fields(); 
					}
					if (typeof remove_mandatory_highlight === 'function') { 
						remove_mandatory_highlight(mandatory_fields); 
					}
				});
			},
			html: true,
			open: function(event, ui) {
				$(".ui-autocomplete").css({"z-index": 1000, "padding": "0px"});
				$(".ui-autocomplete").width($(this).innerWidth());
			}
		}).autocomplete("instance")._renderItem = function(ul, item) {
			if (item["label"] == "No matches found" || item["label"] == "No Data") {
				var list_item = '<li class="text-center">\
					<div><strong>' + item["label"] + '</strong></div>\
				</li>';
			}
			else {
				if (data_image && data_image != "0") {
					var list_item = '<li class="ui-menu-li-image">';
				}
				else {
					var list_item = '<li>';
				}

				if (data_image && data_image != "0") {
					if (item[data_image]) {
						var ignore_links = ['http://', 'https://'];

						if (ignore_links.contains(item[data_image].substring(0, 7)) || ignore_links.contains(item[data_image].substring(0, 8))) {
							var image_url = trim(item[data_image]);
						}
						else {
							var image_url = base_url + trim(item[data_image]);
						}

						list_item += '<img src="' + image_url + '" class="ui-menu-item-image" />';
					}
					else {
						list_item += '<div class="ui-menu-item-image">\
							<span class="default-avatar">\
								<i class="fa fa-user fa-lg"></i>\
							</span>\
						</div>';
					}

					list_item += '<span class="ui-menu-item-text">' + item["label"] + '</span>';
				}
				else {
					list_item += '<div>' + item["label"] + '</div>';
				}

				list_item += '</li>';
			}

			return $(list_item).appendTo(ul);
		};

		$(this).on('focus', function() {
			if(!$(this).val().trim()) {
				$(this).keydown(); 
			}
		});
	});
}

// enable date picker for all elements on page
function enable_datepicker() {
	$("body").find(".date").datepicker({
		format: 'dd-mm-yyyy',
		todayBtn: "linked",
		keyboardNavigation: false,
		forceParse: false,
		autoclose: true
	}).on('changeDate', function(ev) {
		if (typeof change_doc === "function") {
			change_doc();
		}
	});
}

// enable datetime picker for all elements on page
function enable_datetimepicker() {
	$("body").find(".datetimepicker").datetimepicker({
		icons: {
			time: 'fa fa-clock-o',
			date: 'fa fa-calendar',
			up: 'fa fa-chevron-up',
			down: 'fa fa-chevron-down',
			previous: 'fa fa-chevron-left',
			next: 'fa fa-chevron-right',
			today: 'fa fa-crosshairs',
			clear: 'fa fa-trash',
			close: 'fa fa-times'
		},
		format: 'DD-MM-YYYY hh:mm A',
		allowInputToggle: true,
	}).on("dp.change", function(e) {
		if (typeof change_doc === "function") {
			change_doc();
		}
	});
}

// enable simple text editor for all elements on page
function enable_text_editor() {
	$("body").find('.text-editor').trumbowyg({
		btns: [
			['viewHTML'],
			['formatting'],
			'btnGrp-design',
			['image'],
			'btnGrp-justify',
			['fullscreen']
		]
	}).on('tbwchange', function(){ 
		if (typeof change_doc === "function") {
			change_doc();
		}
	});
}

// enable advanced text editor for all elements on page
function enable_advanced_text_editor() {
	$("body").find('.text-editor-advanced').trumbowyg({
		btnsDef: {
			image: {
				dropdown: ['insertImage', 'upload'],
				ico: 'insertImage'
			}
		},
		btns: [
			['viewHTML'],
			['undo', 'redo'],
			['formatting'],
			'btnGrp-design',
			['link'],
			['image'],
			'btnGrp-justify',
			'btnGrp-lists',
			['foreColor', 'backColor'],
			['preformatted'],
			['table'],
			['horizontalRule'],
			['fullscreen']
		]
	}).on('tbwchange', function(){ 
		if (typeof change_doc === "function") {
			change_doc();
		}
	});
}

// msgbox
function msgbox(msg, footer, title, size) {
	$("#message-box").on("show.bs.modal", function (e) {
		$(this).find(".modal-title").html(title ? title : "Message");
		$(this).find(".modal-body").html(msg);

		if (footer) {
			$(this).find(".modal-footer").html(footer);
			$(this).find(".modal-footer").show();
		}
		else {
			$(this).find(".modal-footer").html("");
			$(this).find(".modal-footer").hide();
		}
	})
	.on('hidden.bs.modal', function (e) {
		$(this).find(".modal-title").html("Message");
		$(this).find(".modal-body").html("");
		$(this).find(".modal-footer").html("");
		$(this).find(".modal-footer").hide();
	});

	$('#message-box').modal('show');
}

// toastr notification
function notify(msg, type) {
	toastr.options = {
		"closeButton": true,
		"debug": false,
		"progressBar": false,
		"preventDuplicates": false,
		"positionClass": "toast-top-right",
		"onclick": null,
		"showDuration": "400",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};

	msg = '<strong>' + msg + '</strong>';

	if (type == "success") {
		toastr.success(msg);
	}
	else if (type == "warning") {
		toastr.warning(msg);
	}
	else if (type == "info") {
		toastr.info(msg);
	}
	else if (type == "error") {
		toastr.error(msg);
	}
	// default notification
	else {
		toastr.success(msg);
	}
}

// add status labels, icon for money related fields
function beautify_list_view(table) {
	// field defaults
	var money_list = ['total_amount', 'grand_total', 'rate', 'amount', 'debit', 'credit', 'price'];
	var contact_list = ['contact_no', 'phone_no', 'phone', 'mobile', 'mobile_no'];
	var address_list = ['address', 'full_address', 'city', 'venue'];
	var email_list = ['email_id', 'guest_id'];
	var label_list = ['is_active', 'show_in_module_section', 'role'];
	var label_bg = {
		'is_active' : { '1' : {'value': 'Yes', 'label': 'label-success'}, '0' : {'value': 'No', 'label': 'label-danger'} }, 
		'role' : { 'Administrator' : 'label-default', 'Guest' : 'label-info' }, 
		'show_in_module_section' : { '1' : 'label-success', '0' : 'label-danger' }, 
	}

	var table = table ? table : "table.list-view";
	var thead = $(table).find("thead");
	var tbody = $(table).find("tbody");

	// make table heading
	$.each($(thead).find("tr > th"), function() {
		if ($(this).attr("name")) {
			var heading_name = $(this).attr("name");
			var heading = heading_name.replace(/_/g, " ").toProperCase();

			if (heading.indexOf("Id") > -1) {
				heading = heading.replace("Id", "ID");
			}

			if (money_list.contains(heading_name)) {
				$(this).html(heading + ' (<i class="fa fa-inr"></i>)');
			}
			else {
				$(this).html(heading);
			}
		}
	});

	if ($(tbody).find("tr").length < 1) {
		row = '<tr>\
			<td style="text-align:center; padding:10px; border-bottom:none;" colspan="' + $(thead).find("tr > th").length + '">\
				<div class="h4"><strong>No Data</strong></div>\
			</td>\
		</tr>';

		$(table).find('tbody').empty().append(row);
	}
	else {
		// make table rows
		$.each($(tbody).find("tr > td"), function() {
			if ($(this).attr("data-field-name")) {
				var column_name = $(this).attr("data-field-name");
				var column_value = $.trim($(this).html());
				if ($.trim(column_value) != "") {
					if (money_list.contains(column_name)) {
						$(this).html('<i class="fa fa-inr"></i> ' + column_value);
					}
					else if (contact_list.contains(column_name)) {
						$(this).html('<i class="fa fa-phone"></i> ' + column_value);
					}
					else if (address_list.contains(column_name)) {
						$(this).html('<i class="fa fa-map-marker"></i> ' + column_value);
					}
					else if (email_list.contains(column_name)) {
						$(this).html('<i class="fa fa-envelope"></i> ' + column_value);
					}
					else if (label_list.contains(column_name)) {
						if (typeof label_bg[column_name][column_value] === "object") {
							$(this).html('<span class="label ' + label_bg[column_name][column_value]["label"] + '">' + label_bg[column_name][column_value]["value"] + '</span>');
						}
						else {
							$(this).html('<span class="label ' + label_bg[column_name][column_value] + '">' + column_value + '</span>');
						}
					}
					else if (column_value.isDate()) {
						$(this).html('<i class="fa fa-calendar"></i> ' + moment(column_value).format('DD-MM-YYYY'));
					}
					else if (column_value.isDateTime()) {
						$(this).html('<i class="fa fa-calendar"></i> ' + moment(column_value).format('DD-MM-YYYY hh:mm A'));
					}
					else if (column_value.isTime()) {
						$(this).html('<i class="fa fa-clock-o"></i> ' + column_value);
					}
				}
			}
		});
	}
}

// create pagination html
function make_pagination(data) {
	var first_enabled = true;
	var last_enabled = true;
	var first = data['first_page_url'];
	var prev = data['prev_page_url'];
	var next = data['next_page_url'];
	var last = data['last_page_url'];

	var pagination = '<ul class="pagination origin-pagination">';

	if (data['current_page'] == 1) {
		first_enabled = false;
	}

	if (data['current_page'] == data['last_page']) {
		last_enabled = false;
	}

	pagination += '<li class="paginate_button first' + (first_enabled ? "" : " disabled") + '">\
		<a href="' + (first_enabled ? first : "#") + '" data-dt-idx="0" tabindex="0">\
			<span class="hidden-xs">First</span>\
			<span class="visible-xs"><i class="fa fa-angle-double-left"></i></span>\
		</a>\
	</li>\
	<li class="paginate_button previous' + (prev ? "" : " disabled") + '">\
		<a href="' + (prev ? prev : "#") + '" data-dt-idx="1" tabindex="0">\
			<span class="hidden-xs">Previous</span>\
			<span class="visible-xs"><i class="fa fa-angle-left"></i></span>\
		</a>\
	</li>';

	pagination += '<li class="paginate_button next' + (next ? "" : " disabled") + '">\
		<a href="' + (next ? next : "#") + '" data-dt-idx="2" tabindex="0">\
			<span class="hidden-xs">Next</span>\
			<span class="visible-xs"><i class="fa fa-angle-right"></i></span>\
		</a>\
	</li>\
	<li class="paginate_button last' + (last_enabled ? "" : " disabled") + '">\
		<a href="' + (last_enabled ? last : "#") + '" data-dt-idx="3" tabindex="0">\
			<span class="hidden-xs">Last</span>\
			<span class="visible-xs"><i class="fa fa-angle-double-right"></i></span>\
		</a>\
	</li>';

	pagination += '</ul>';
	return pagination;
}

function sticky_relocate() {
	var window_top = $(window).scrollTop();

	if ($('#sticky-anchor') && typeof $('#sticky-anchor').offset() !== "undefined") {
		var div_top = $('#sticky-anchor').offset().top;

		if (window_top > div_top) {
			$('#sticky').addClass('stick');
			$('#sticky-anchor').height($('#sticky').outerHeight());
		} else {
			$('#sticky').removeClass('stick');
			$('#sticky-anchor').height(0);
		}
	}
}

// Removes any white space to the right and left of the string
function trim(str) {
	return str.replace(/^\s+|\s+$/g, "");
}

// Removes any white space to the left of the string
function ltrim(str) {
	return str.replace(/^\s+/, "");
}

// Removes any white space to the right of the string
function rtrim(str) {
	return str.replace(/\s+$/, "");
}

// Is an object a string
function isString(obj) {
	return typeof (obj) == 'string';
}

// Is an object a email address
function isEmail(obj) {
	if (isString(obj)) {
		return obj.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/ig);
	}
	else {
		return false;
	}
}

// convert mysql date time to javascript date time
function mysqlDateTimeToJSDate(datetime) {
	// Split timestamp into [ Y, M, D, h, m, s ]
	var t = datetime.split(/[- :]/);
	return new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
}