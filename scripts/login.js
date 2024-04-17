window.onload = function() {
    fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('logoutButton').style.display = 'block';
        }
    });
};

document.getElementById('logoutButton').onclick = function() {
    fetch('/auth/logout')
      .then(response => response.json())
      .then(data => {
        if (data.loggedOut) {
          location.reload();
        }
      });
  };