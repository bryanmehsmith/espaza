function showToast(message) {
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '50%';
    toast.style.left = '50%';
    toast.style.transform = 'translate(-50%, -50%)';
    toast.style.background = 'green';
    toast.style.color = 'white';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    document.body.appendChild(toast);
    setTimeout(function() {
        document.body.removeChild(toast);
    }, 3000);
}

document.getElementById('showRegisterFormButton').onclick = function() {
    document.getElementById('userLoginForm').style.display = 'none';
    document.getElementById('userRegisterForm').style.display = 'block';
    this.style.display = 'none';
};

document.getElementById('userRegisterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var data = {
        name: document.getElementById('name').value,
        email: document.getElementById('emailRegister').value,
        password: document.getElementById('passwordRegister').value
    };

    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function(response) {
        if (response.ok) {
            showToast('Registration successful!');
            return response.json();
        } else {
            throw new Error('Error: ' + response.statusText);
        }
    }).then(function(responseJson) {

    }).catch(function(error) {
        console.error('Error:', error);
    });
});

document.getElementById('userLoginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var email = document.getElementById('emailLogin').value;
    var password = document.getElementById('passwordLogin').value;

    fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    }).then(function(response) {
        if (response.ok) {
            showToast('Login successful!');
            return response.json();
        } else {
            throw new Error('Error: ' + response.statusText);
        }
    }).then(function(responseJson) {
        localStorage.setItem('token', responseJson.token);
        document.getElementById('logoutButton').style.display = 'block';
        document.querySelector('.fa-user').style.color = 'green';
    }).catch(function(error) {
        console.error('Error:', error);
    });
});

if (localStorage.getItem('token')) {
    document.getElementById('logoutButton').style.display = 'block';
}

document.getElementById('logoutButton').onclick = function() {
    localStorage.removeItem('token');
    location.reload();
};