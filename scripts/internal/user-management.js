function saveChanges(userId) {
    const role = document.querySelector(`input[name="user-${userId}-Permission"]:checked`).value;
    fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
}

fetch('/users')
  .then(response => response.json()) // Parse the JSON from the response
  .then(users => {
    // Create a table row for each user
    const userRows = users.map(user => `
      <tr>
        <td>${user.name}</td>
        <td>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="user-${user.id}-Permission" id="user-${user.id}-Staff" value="Staff">
            <label class="form-check-label" for="user-${user.id}-Staff">Staff</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="user-${user.id}-Permission" id="user-${user.id}-Admin" value="Admin">
            <label class="form-check-label" for="user-${user.id}-Admin">Admin</label>
          </div>
        </td>
        <td>
          <button class="btn d-flex m-2 py-2 bg-light rounded-pill active" onclick="saveChanges('${user.id}')">Save Changes</button>
        </td>
        <td>
        <button type="submit" class = "btn d-flex m-2 py-2 fa-2x" style= "color:rgb(175, 21, 21);text-shadow:2px 2px 4px #9b9b9b;">
            <i class="bi bi-trash" onclick="deleteUser('${user.id}')"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Insert the user rows into the table body
    document.querySelector('tbody').innerHTML = userRows;
  })
  .catch(error => console.error('Error:', error));