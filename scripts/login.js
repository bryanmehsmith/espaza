fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
          document.getElementById('loginButton').style.display = 'none';
          document.getElementById('logoutButton').style.display = 'block';
        } else {
          document.getElementById('loginButton').style.display = 'block';
          document.getElementById('logoutButton').style.display = 'none';
        }
    });

document.getElementById('logoutButton').onclick = function() {
    fetch('/auth/logout')
      .then(response => response.json())
      .then(data => {
        if (data.loggedOut) {
          location.reload();
        }
      });
  };