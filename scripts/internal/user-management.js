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
    .then(data => {
      console.log('Success:', data);
  })
    .catch((error) => console.error('Error:', error));
}

function deleteUser(id) {
  fetch(`/users/${id}`, {
      method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
      var row = document.getElementById('user-row-' + id);
      row.parentNode.removeChild(row);
  })
  .catch((error) => console.error('Error:', error));
}

fetch('/users')
  .then(response => response.json())
  .then(data => {
    const users = data.users;
    const requestingUserId = data.requestingUserId;

    const userRows = users.map(user => `
      <tr  id="user-row-${user.id}">
        <td>${user.name}</td>
        <td>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="user-${user.id}-Permission" id="user-${user.id}-Shopper" value="Shopper" ${user.role === 'Shopper' ? 'checked' : ''} ${user.id === requestingUserId ? 'disabled' : ''} onBlur="saveChanges('${user.id}', this.value)">
            <label class="form-check-label" for="user-${user.id}-Shopper">Shopper</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="user-${user.id}-Permission" id="user-${user.id}-Staff" value="Staff" ${user.role === 'Staff' ? 'checked' : ''} ${user.id === requestingUserId ? 'disabled' : ''} onBlur="saveChanges('${user.id}', this.value)">
            <label class="form-check-label" for="user-${user.id}-Staff">Staff</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="user-${user.id}-Permission" id="user-${user.id}-Admin" value="Admin" ${user.role === 'Admin' ? 'checked' : ''} ${user.id === requestingUserId ? 'disabled' : ''} onBlur="saveChanges('${user.id}', this.value)">
            <label class="form-check-label" for="user-${user.id}-Admin">Admin</label>
          </div>
        </td>
        <td>
        <button type="submit" class = "btn d-flex m-2 py-2 fa-2x" style= "color:rgb(175, 21, 21);text-shadow:2px 2px 4px #9b9b9b;" ${user.id === requestingUserId ? 'disabled' : ''}>
            <i class="bi bi-trash" onclick="deleteUser('${user.id}')"></i>
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = userRows;

    //reporting
    $(document).ready(function(){
      $("#usersTable").DataTable({
          dom: 'Bfrtip',
          searching: false,
          buttons: [
            {
              extend: 'copyHtml5',
              title: 'users-report',
              exportOptions: {
                format: {
                  body: function(inner, rowidx, colidx, node) {
                    if ($(node).find("input[type='text']").length > 0) {
                      return $(node).find("input[type='text']").val();
                    } else if ($(node).find("select").length > 0) {
                      return $(node).find("select option:selected").text();
                    } else if ($(node).find("input[type='radio']:checked").length > 0) {
                      return $(node).find("input[type='radio']:checked").val();
                    } else if ($(node).find(".form-check-inline input[type='checkbox']:checked").length > 0) {
                      return $(node).find(".form-check-inline input[type='checkbox']:checked").map(function() {
                        return $(this).val();
                      }).get().join(", ");
                    } else if ($(node).find("input[type='checkbox']:checked").length > 0) {
                      return $(node).find("input[type='checkbox']:checked").val();
                    } else {
                      return $(node).text();
                    }
                  }
                }
              }
            },
            {
              extend: 'excelHtml5',
              title: 'users-report',
              exportOptions: {
                format: {
                  body: function(inner, rowidx, colidx, node) {
                    if ($(node).find("input[type='text']").length > 0) {
                      return $(node).find("input[type='text']").val();
                    } else if ($(node).find("select").length > 0) {
                      return $(node).find("select option:selected").text();
                    } else if ($(node).find("input[type='radio']:checked").length > 0) {
                      return $(node).find("input[type='radio']:checked").val();
                    } else if ($(node).find(".form-check-inline input[type='checkbox']:checked").length > 0) {
                      return $(node).find(".form-check-inline input[type='checkbox']:checked").map(function() {
                        return $(this).val();
                      }).get().join(", ");
                    } else if ($(node).find("input[type='checkbox']:checked").length > 0) {
                      return $(node).find("input[type='checkbox']:checked").val();
                    } else {
                      return $(node).text();
                    }
                  }
                }
              }
            },
            {
              extend: 'pdfHtml5',
              title: 'users-report',
              exportOptions: {
                format: {
                  body: function(inner, rowidx, colidx, node) {
                    if ($(node).find("input[type='text']").length > 0) {
                      return $(node).find("input[type='text']").val();
                    } else if ($(node).find("select").length > 0) {
                      return $(node).find("select option:selected").text();
                    } else if ($(node).find("input[type='radio']:checked").length > 0) {
                      return $(node).find("input[type='radio']:checked").val();
                    } else if ($(node).find(".form-check-inline input[type='checkbox']:checked").length > 0) {
                      return $(node).find(".form-check-inline input[type='checkbox']:checked").map(function() {
                        return $(this).val();
                      }).get().join(", ");
                    } else if ($(node).find("input[type='checkbox']:checked").length > 0) {
                      return $(node).find("input[type='checkbox']:checked").val();
                    } else {
                      return $(node).text();
                    }
                  }
                }
              }
            }
          ]
      });
  });
  
  })
  .catch(error => console.error('Error:', error));

document.getElementById('search').addEventListener('keyup', function() {
  let searchValue = this.value.toLowerCase();
  let rows = document.querySelectorAll('.table tbody tr');

  rows.forEach(row => {
    let userName = row.cells[0].textContent.toLowerCase();

    if (userName.indexOf(searchValue) > -1) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});
