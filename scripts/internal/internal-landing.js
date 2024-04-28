fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
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

                    // Internal logic
                    const rolesInternal = ['Admin', 'Staff'];
                    if (rolesInternal.includes(data.role)) {
                        document.querySelector('#stock-management').style.display = 'block';
                    }

                    // Admin logic
                    const rolesAdmin = ['Admin'];
                    if (rolesAdmin.includes(data.role)) {
                        document.querySelector('#user-management').style.display = 'block';
                    }
                });
        } else {

        }
    });