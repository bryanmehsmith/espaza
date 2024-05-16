function fetchUnreadNotificationsCount() {
    fetch(`/notifications`)
        .then(response => response.json())
        .then(data => {
            const unreadNotifications = data.filter(notification => notification.isRead === 0);
            const unreadCount = unreadNotifications.length;
            const unreadCountElement = document.getElementById('unreadCount');
            unreadCountElement.textContent = unreadCount;
            if (unreadCount > 0) {
                unreadCountElement.style.display = 'inline-block';
            } else {
                unreadCountElement.style.display = 'none';
            }
        })
        .catch((error) => console.error('Error:', error));
}

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
                        fetchUnreadNotificationsCount();
                        setInterval(fetchUnreadNotificationsCount, 60000);
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
    }
);