$( document ).ready(function() {
	var current_page = 1;
	refresh_activity(current_page);

	$(".refresh-activity").on("click", function() {
		current_page = 1;
		refresh_activity(current_page);
	});

	// get records when click on pagination links
	$('body').on('change', '.activity-filter', function (e) {
		current_page = 1;
		refresh_activity(current_page);
	});

	// get records when click on pagination links
	$('body').on('click', '.origin-pagination a', function (e) {
		e.preventDefault();

		if ($(this).attr('href') != "#" && $(this).attr('href').indexOf('page=') >= 0) {
			current_page = $(this).attr('href').split('page=')[1];
			refresh_activity(current_page);
		}
	});

	function refresh_activity(page) {
		var data = get_filters_data();
		$(".data-loader").show();

		$.ajax({
			type: 'GET',
			url: app_route + '?page=' + page,
			data: data,
			dataType: 'json',
			success: function(data) {
				var app_activities = data['activities']['data'];
				var current_user = data['current_user'];
				var number_start = data['activities']['from'];
				var activities = "";
				$('body').find('.no-data').remove();

				if (app_activities.length > 0) {
					$.each(app_activities, function(index, row) {
						var desc = false;
						var user_name = (current_user["id"] == row["user_id"]) ? "You" : row["user"];
						var user = '<strong>' + user_name + '</strong>';
						var from_now_time = moment(row['created_at']).fromNow();
						var actual_time = moment(row['created_at']).format("MMM D, YYYY on hh:mm A");

						if (row['action'] == "Create")
							var icon_bg = "bg-blue"
						else if (row['action'] == "Update")
							var icon_bg = "bg-yellow"
						else if (row['action'] == "Delete")
							var icon_bg = "bg-red"
						else {
							var icon_bg = "bg-aqua"
						}

						if (row["module"] == "Auth") {
							if (row["action"] == "Login") {
								desc = user + " " + "logged in";
							}
							else {
								desc = user + " " + "logged out";
							}
						}
						else {
							if (row["form_id"]) {
								var activity_link = '<strong>' + row["module"] + ': ' + row["form_title"] + '</strong>';
							}

							if (row["action"] == "Create") {
								desc = "New" + " " + activity_link + " " + "created by" + " " + user;
							}
							else if (row["action"] == "Update") {
								desc = activity_link + " " + "updated by" + " " + user;
							}
							else if (row["action"] == "Delete") {
								desc = '<strong>' + row["module"] + ': ' + row["form_title"] + '</strong>';
								desc += ' ' + 'deleted by' + ' ' + user;
							}
						}

						activities += '<li>\
							<i class="' + row["icon"] + ' ' + icon_bg + '"></i>\
							<div class="timeline-item">\
								<span class="time">\
									<i class="fa fa-clock-o"></i> ' + from_now_time + '\
								</span>\
								<div class="timeline-body no-border">' + desc + '<br />\
									<small class="text-muted">' + actual_time + '</small>\
								</div>\
							</div>\
						</div>';
					});

					$('.origin-activities').empty().append(activities);
				}
				else {
					activities = '<div class="h4 text-center no-data"><strong>No Data</strong></div>';

					$('.origin-activities').empty();
					$('.origin-activities').after(activities);
				}

				$(".data-loader").hide();
				$("#item-count").html(data['activities']['total'] || '0');
				$("#item-from").html(data['activities']['from'] || '0');
				$("#item-to").html(data['activities']['to'] || '0');
				$(".origin-pagination-content").empty().append(make_pagination(data['activities']));
			},
			error: function(e) {
				notify(JSON.parse(e.responseText)['message'], "error");
				$(".data-loader").hide();
			}
		});
	}

	$(window).on('hashchange', function() {
		if (window.location.hash) {
			var page = window.location.hash.replace('#', '');

			if (page == Number.NaN || page <= 0) {
				return false;
			}
			else {
				refresh_activity(page);
			}
		}
	});

	// prepare all filters data
	function get_filters_data() {
		var data = {};
		var filters = {};
		var owner = $('body').find('[name="owner"]').val();
		var action = $('body').find('[name="action"]').val();
		var module = $('body').find('[name="module"]').val();

		if (owner || action || module) {
			if (owner) {
				filters['owner'] = owner
			}

			if (action) {
				filters['action'] = action
			}

			if (module) {
				filters['module'] = module
			}

			data['filters'] = filters;
		}

		return data;
	}
});