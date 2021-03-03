function deleteUser(id){
    $.ajax({
        url: '/users/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload();
        }
    })
};