function fetchNotifications() {
    fetch(`/notifications/`) 
        .then(response => response.json())
        .then(data => {
            const notificationList = document.getElementById('notificationList');
            notificationList.innerHTML = ''; // Clear the existing list

            // Sort notifications by createdAt timestamp in descending order
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            data.forEach(notification => {
                const template = document.getElementById('notificationTemplate');
                if (!template) {
                    console.error("Notification template element not found!");
                    return; // Skip processing if template is missing
                }

                const notificationItem = template.content.cloneNode(true);

                notificationItem.querySelector('.orderId').textContent = notification.orderId;
                notificationItem.querySelector('.message').textContent = notification.message;
                notificationItem.querySelector('.timestamp').textContent = formatTimestamp(notification.createdAt);

                // Add different class based on read status
                const listItem = notificationItem.querySelector('.list-group-item');
                if (notification.isRead === 0) {
                    listItem.classList.add('unread');
                } else {
                    listItem.classList.add('read');
                }

                // Add event listener to mark notification as read when clicked
                listItem.addEventListener('click', () => {
                    if (notification.isRead === 0) {
                        markNotificationAsRead(notification.id);
                    }
                });

                notificationList.appendChild(notificationItem);
            });

            // Update the unread count in the header
            updateUnreadCount(data.filter(notification => notification.isRead === 0).length);
        })
        .catch((error) => console.error('Error:', error));
}


function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function markNotificationAsRead(notificationId) {
    fetch(`/notifications/${notificationId}/read`, { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            fetchNotifications(); // Refresh the notifications list
        })
        .catch((error) => console.error('Error:', error));
}

function updateUnreadCount(count) {
    const unreadCountElement = document.getElementById('unreadCount');
    unreadCountElement.textContent = count;
    unreadCountElement.style.display = count > 0 ? 'inline-block' : 'none';
}

// Call the function to fetch notifications when the page loads
fetchNotifications();