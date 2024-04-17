window.onload = function() {
    fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.querySelector('.fa-user').style.color = 'green';
        }
    });
};