$(document).ready(function(){
    $.ajax({
        type: 'GET', 
        url: '/get_all_by_team', 
        data: {
            team: "mlx"
        },
        dataType: "json"
    }).done((data) => {
        console.log(`Data: ${data}`);
    })
})