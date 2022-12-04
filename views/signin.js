/*$(document).ready(function(){
    $("#signin-form").submit((e) => {
        e.preventDefault();
        var formData = $("#signin-form").serializeArray().reduce((obj, item) => {
            obj[item.name] = item.value;
            return obj;
        }, {});

        console.log(Object.keys(formData));
        console.log(formData['signin-name']);
        
        $.ajax({
            method: "POST", 
            url: "/auth",
            data: formData,
            dataType: "json", 
            encoded: true,
        }).done((data) => {
            window.location.href = "https://127.0.0.1/";
            console.log("DONE WITH AJAX");
        })
        .fail((err) => {
            console.log($("html").length);
            $("html").html($(err.responseText));
            window.location.href = "localhost:3000/";
        });
    })
});
*/