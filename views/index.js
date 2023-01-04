
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

// Change selected lift time
$(document).ready(function () {
    if (userTodayLifttime){
        if (userTodayLifttime === '7:30') {
            $("#730btn").addClass("button-active");
        } else {
            $("#830btn").addClass("button-active");
        }
    }
})

// Update user lifttime 
$(document).ready(function () {
    $(".lifttime-btn").click((e) => {
        let btnTime;
        console.log("LOOK HERE");
        let target = $(e.target);
        console.dir(target);
        console.log(target.prop("tagName"));
        // if div was clicked
        if (target.prop("tagName") === "DIV") {
            btnTime = target.attr("id");
            console.log(`Div clicked, id is ${btnTime}`);
        } else if (target.prop("tagName") === "P") {
            let divParent = target.parent("div");
            console.log(`P tag clicked, id of div parent is: ${divParent.attr("id")}`);
            btnTime = divParent.attr("id");
        }
        let time;
        if (btnTime === "730btn") {
            time = "7:30";
        } else {
            time = "8:30";
        }
        console.log(`BtnTime: ${time}`)

        $.ajax({
            type: "POST",
            url: "/set_today_lifttime",
            data: {
                'today_time': time
            },
            dataType: "json",
            encode: true
        }).done((data) => console.dir(data))
    })
})

// Load roommates
// $(document).ready(function() {
//     console.log("Index.js load roommates")
//     $.get("/get_all_roommates").done(data => function(){
//         console.dir(data);
//        // createRoommates(data)
//     });
// });

function createRoommates(data){
    console.log("DAta in createroommates");
    console.dir(data);
}