fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.querySelector('.bi-person-fill').style.color = 'green';
            document.querySelector('#user-link').href = '/';
            document.querySelector('#user-link').onclick = function() {
                fetch('/auth/logout')
            };
        } else {
            document.querySelector('#user-link').href = '/auth/google';
        }
    });