// $(document).ready(function(){
//     $.ajax({
//         type: 'GET', 
//         url: '/get_all_by_team', 
//         data: {
//             team: "mlx"
//         },
//         dataType: "json"
//     }).done((data) => {
//         console.log(`Data: ${data}`);
//     })
// })

$(document).ready(function(){
    var teamObj = JSON.parse(team);
    
    console.dir(teamObj);

    for (const [year, yearUsers] of Object.entries(teamObj)){
        let classContainerDiv = buildClassContainerDiv(year);
        console.log(yearUsers);
        yearUsers.forEach(yearUser => {
            classContainerDiv.append(buildDivFromUser(yearUser))
        });
        $('body').append(classContainerDiv);
    }
    // for(let k in teamObj){
    //     let classContainerDiv = buildClassContainerDiv(k);

    //     for(let usr in k){
    //         console.log("User: ");
    //         console.dir(usr);
    //         let userDivObj = buildDivFromUser(usr);
    //         classContainerDiv.append(userDivObj);
    //     }

    //     $('body').append(classContainerDiv);
    // }
});

function buildClassContainerDiv(userClass){
    var templateString = `<div class='class-container vflex'>
    <div class='class-container-header'>${userClass}</div>
    </div>`;

    var classContainer = $($.parseHTML(templateString));
    return classContainer;
}

function buildDivFromUser(user){
    let awakeStatusClass = user['awake'] ? 'awake':'not-awake';
    let name = user['username'];
    let lifttime = user['today_lifttime'];
    let phone_number = user['phone_number'];

    var templateString = `
    <div class='teammate-row hflex'>
    <div class='thumbnail-img ${awakeStatusClass}'></div>
    <div class='thumbnail-name'>${name}</div>
    <div class='thumbnail-lifttime'>Going to ${lifttime}</div>
    <a href='tel:+${phone_number} class='thumbnail-phonenumber'>${phone_number}</div>
    </div>
    `;
    var userDiv = $($.parseHTML(templateString));
    return userDiv;
}
