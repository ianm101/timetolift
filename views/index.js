
// Handle toggling of active/inactive for buttons
$(document).ready(function () {
    $(".button").click(function () {
        // Check for no-siblings case, in which case just toggle
        if ($(this).siblings(".button").length === 0) {
            if ($(this).hasClass("button-active")) {
                $(this).removeClass("button-active");
            } else {
                $(this).addClass("button-active");
            }
        } else {
            $(this).siblings(".button").removeClass("button-active");
            $(this).addClass("button-active");
        }
    });
});

// Toggle awake/not state and ping database with update
$(document).ready(function () {
    $("#main-awake-button").click(function () {
        // Make the database call

        $.ajax({
            type: "POST",
            url: "/toggle_user_awake",
            data: {},
            dataType: "json",
            encode: true
        }).done((queryData) => {
            console.log('---------');
            console.dir(queryData);
            if (queryData['query_success']) {
                if (queryData['isAwake']) {
                    $(this).removeClass('not-awake');
                    $(this).addClass('awake');
                    $(this).children('p').text("I'M AWAKE");
                } else {
                    $(this).removeClass('awake');
                    $(this).addClass('not-awake');
                    $(this).children('p').text("I'M ASLEEP");
                }
            }
        },
            (err) => {
                if (typeof err !== 'undefined') {
                    console.error(err.message)
                }
            });
    });
});

// Change text depending on state
$(document).ready(function () {
    $("#testbutton").click(function () {
        var temp = $("template");
        var clone = temp.html();
        $("#roommate-card-container").append(clone);
    });
})