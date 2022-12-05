$(document).ready(function(){
    $("#registration-form").submit(function(event){
        console.log(window.location);
//         var formData = {
//             name: $('input[name="reg-name"]').val(),
//             phone_number: $('input[name="reg-phone_number"]').val(),
//             team: $('select[name="reg-team"]').val(),
//             year: $('select[name="reg-year"]').val()
//         };

//         $.ajax({
//             type: "POST", 
//             url: "/register",
//             data: formData,
//             dataType: "json",
//             encode: true
//         }).done(function (data){
//             console.dir(data);
//         });

    })
})