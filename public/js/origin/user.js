$( document ).ready(function() {
	if ($('[name="id"]').val()) {
		var status_bar = '<div class="box-header with-border">\
			<div class="row">\
				<div class="col-md-3 col-sm-12">\
					Email Confirmed: ';

		if (parseInt(origin.data[origin.table_name]["email_confirmed"])) {
			status_bar += '<span class="label label-success" id="email_confirmed">Yes</span>';
		}
		else {
			status_bar += '<span class="label label-danger" id="email_confirmed">No</span>';
		}

		status_bar += '</div>\
			</div>\
		</div>';

		$(status_bar).insertAfter($(".form-container").find(".box-header:first"));
	}
});