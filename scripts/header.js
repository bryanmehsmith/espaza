fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.querySelector('.bi-person-fill').style.color = 'green';
            document.querySelector('#user-link').href = '/';
            document.querySelector('#user-link').onclick = function() {
                fetch('/auth/logout')
            };
            fetch('/auth/userRole')
                .then(response => response.json())
                .then(data => {
                    if (data.role !== 'Staff' && data.role !== 'Admin') {
                        document.querySelector('#internal-link').style.display = 'none';
                    }
                });
        } else {
            document.querySelector('#user-link').href = '/auth/google';
            document.querySelector('#internal-link').style.display = 'none';
        }
    });