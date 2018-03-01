$( document ).ready(function() {
	var current_page = 1;
	refresh_activity(current_page);

	$(".refresh-activity").on("click", function() {
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
		$(".data-loader").show();

		$.ajax({
			type: 'GET',
			url: app_route + '?page=' + page,
			dataType: 'json',
			success: function(data) {
				var app_activities = data['activities']['data'];
				var current_user = data['current_user'];
				var number_start = data['activities']['from'];
				var activities = "";

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
				}

				$(".data-loader").hide();
				$('.origin-activities').empty().append(activities);
				$("#item-count").html(data['activities']['total']);
				$("#item-from").html(data['activities']['from']);
				$("#item-to").html(data['activities']['to']);
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
});