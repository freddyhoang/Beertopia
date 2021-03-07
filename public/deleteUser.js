
// $(document).ready(function(){
//     $("#user-table").on("click", function() {
//         console.log('test');
//         var user_id = e.target.getAttribute('id');
//         console.log(user_id)
//         $.ajax({
//             url: '/users/' + user_id,
//             type: 'DELETE',
//             success: function(result){
//                 window.location.reload();
//             }
//         })
//     })
// });

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('alert-time').addEventListener('click', removeAlert);
});

function deleteUser(id){
    $.ajax({
        url: '/users/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload();
        }
    })
};

var removeAlert = (event) => {
    document.getElementById('alert-time').innerHTML = ''
    document.getElementById('alert-time').classList = '';
}