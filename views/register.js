$(document).ready(function(){
    $("#registration-form").submit(function(event){
        var formData = {
            name: $('input[name="reg-name"]').val(),
            phone_number: $('input[name="reg-phone_number"]').val(),
            team: $('input[name="reg-team"]').val()
        };

        $.ajax({
            type: "POST", 
            url: "/registration_ajax",
            data: formData,
            dataType: "json",
            encode: true
        }).done(function (data){
            console.dir(data);
        });

        event.preventDefault();
    })
})