// removes alerts upon click
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('alert-time').addEventListener('click', removeAlert);
    document.getElementById('submit').addEventListener('click', removeAlert);
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
    document.getElementById('alert-time').innerHTML = '';
    document.getElementById('alert-time').classList = '';
}