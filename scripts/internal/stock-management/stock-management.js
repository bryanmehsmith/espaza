function saveChanges(productId, payload) {
    fetch(`/products/${productId}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
  })
    .catch((error) => console.error('Error:', error));
}

function deleteProduct(id) {
  fetch(`/products/${id}`, {
      method: 'DELETE',
  })
  .then(response => {
      if (response.ok) {
          console.log('Success:', response);
          var row = document.getElementById('product-row-' + id);
          row.parentNode.removeChild(row);
      } else {
          throw new Error('Error: ' + response.statusText);
      }
  })
  .catch((error) => console.error('Error:', error));
}

fetch('/products')
  .then(response => response.json())
  .then(data => {
    const products = data.products;

    const productRows = products.map(product => `
      <tr id="product-row-${product.id}">
        <td>
          <input type="text" id="product-name-${product.id}" value="${product.product_name}" onBlur="saveChanges('${product.id}', {'product_name' : this.value})">
        </td>
        <td class="col-md-6">
            <select id="productCategory" class="form-select" onBlur="saveChanges('${product.id}', {'category' : this.value})">
                <option ${product.category === 'Vegetables' ? 'selected' : ''}>Vegetables</option>
                <option ${product.category === 'Fruits' ? 'selected' : ''}>Fruits</option>
                <option ${product.category === 'Bread' ? 'selected' : ''}>Bread</option>
                <option ${product.category === 'Meat' ? 'selected' : ''}>Meat</option>
            </select>
        </td>
        <td>
          <input type="number" id="productPrice-${product.id}" value="${product.price}" onBlur="saveChanges('${product.id}', {'price' : this.value})">
        </td>
        <td>
          <input type="number" id="productQuantity-${product.id}" value="${product.quantity}" onBlur="saveChanges('${product.id}', {'quantity' : this.value})">
        </td>
        <td>
          ${product.quantity == 0 ? 'Out of Stock' : 'In Stock'}
        </td>
        <td>
        <button type="submit" class = "btn d-flex m-2 py-2 fa-2x" style= "color:rgb(175, 21, 21);text-shadow:2px 2px 4px #9b9b9b;">
            <i class="bi bi-trash" onclick="deleteProduct('${product.id}')"></i>
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = productRows;
  })
  .catch(error => console.error('Error:', error));

document.getElementById('search').addEventListener('keyup', function() {
  let searchValue = this.value.toLowerCase();
  let rows = document.querySelectorAll('.table tbody tr');

  rows.forEach(row => {
    let productName = row.querySelector('input[type="text"]').value.toLowerCase();
    let productCategory = row.querySelector('select[id="productCategory"]').value.toLowerCase();
    let productPrice = row.querySelector('input[id^="productPrice-"]').value;
    let productQuantity = row.querySelector('input[id^="productQuantity-"]').value;

    if (
      productName.indexOf(searchValue) > -1 ||
      productCategory.indexOf(searchValue) > -1 ||
      Number(productPrice) === Number(searchValue) ||
      Number(productQuantity) === Number(searchValue)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});