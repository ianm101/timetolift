// Pre-fill
$(document).ready(function () {
    // Name input
    $('input[name="profile-name"]').val(username);
    $('input[name="profile-phone_number"]').val(phone_number);
    $('select[name="profile-year"]').val(year).change();
    $('select[name="profile-team"]').val(team).change();
    $('select[name="profile-lifttime"]').val(lifttime).change();
});

// Prevent add roommate butotn from sending form
$(document).ready(function () {
    $("#add-roommate-btn").click((e) => {
        console.log("button click");
        var inputData = $("#roommate-datalist").val();
        if (inputData.length > 0) {
            // Create component on frontend
            var clone = $("template").clone();
            $("#micro-roommate-container").append(clone.html());
            $("#micro-roommate-container div:last-child").children("p").text(inputData);
            $("#micro-roommate-container div:last-child").attr("roommate-name", inputData);

            console.log(`Found elemnets: ${$(`div[roommate-name="${inputData}"]`).length}`);
            $(`div[roommate-name="${inputData}"]`).click((e) => {
                $(e.target).parent("div").remove();
            })
            // Clear search box
            $("#roommate-datalist").val("");
        }else{
            $("#roommate-alert-div").append('<div class="alert alert-danger">Enter a valid roommate</div>')
            $("div.alert-danger").delay(1000).fadeOut(2000);
            
        }   
    });
});


// Form submission
$(document).ready(function () {
    $("#profile-form").submit((e) => {
        e.preventDefault();

        // Get all roommates
        var roommateNames = [];
        $("p.micro-roommate-name").each(function(){
            roommateNames.push($(this).text());
        });
        var formData = {

            name: $('input[name="profile-name"]').val(),
            phone_number: $('input[name="profile-phone_number"]').val(),
            team: $('select[name="profile-team"]').val(),
            year: $('select[name="profile-year"]').val(),
            lifttime: $('select[name="profile-lifttime"]').val(),
            roommates: roommateNames,
        };

        console.log("Form data");
        console.dir(formData);

        $.ajax({
            type: "POST",
            url: "/profile",
            data: formData,
            dataType: "json",
            encode: true
        }).done(function (data) {
        });
    });
});