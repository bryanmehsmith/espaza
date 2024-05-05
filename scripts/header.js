fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.querySelector('.bi-person-fill').style.color = 'green';
            document.querySelector('#user-link').href = '/';
            document.querySelector('#user-link').onclick = function() {fetch('/auth/logout')};
            fetch('/users/self/userRole')
                .then(response => {
                    if (!response.ok) {
                        // Public Logic

                    }
                    return response.json();
                })
                .then(data => {
                    // Logged in logic
                    const rolesLogged = ['Admin', 'Staff', 'Shopper'];
                    if (rolesLogged.includes(data.role)) {
                        document.querySelector('#notifications').style.display = 'block';
                    }

                    // Internal logic
                    const rolesInternal = ['Admin', 'Staff'];
                    if (rolesInternal.includes(data.role)) {
                        document.querySelector('#internal-link').style.display = 'block';
                    }

                    // Admin logic
                    const rolesAdmin = ['Admin'];
                });
        } else {

        }
    });