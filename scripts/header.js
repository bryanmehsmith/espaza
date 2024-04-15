window.onload = function() {
    if (localStorage.getItem('token')) {
        document.querySelector('.fa-user').style.color = 'green';
    }
};