// Landing page
// Sign-in logic
// 1. Either they have info saved, and login right away
// 2. They are registered but need to enter info

// Registration Logic
// 1. They need to sign up and be added to appropriate team
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

$(document).ready(function(){
    $("#main-awake-button").click(function(){
        $(this).toggleClass("not-awake awake");
        if($(this).hasClass("not-awake")){
            $(this).children('p').text("I'M SCHLEEP");
        }else{
            $(this).children('p').text("I'M WOKE");
        }
    })

    // Change text depending on state
});


// ------- TO BE REMOVED ----------------
// Adds a new roommate card to the page
$(document).ready(function(){
    $("#testbutton").click(function(){
        var temp = $("template");
        var clone = temp.html();
        $("#roommate-card-container").append(clone);
    });
});