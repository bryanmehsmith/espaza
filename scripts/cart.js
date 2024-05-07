function saveChanges(itemId, payload) {
  fetch(`/cart/${itemId}`, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    var totalCell = document.getElementById('product-total-' + itemId);
    totalCell.textContent = payload.quantity * document.getElementById('product-price-' + itemId).textContent;
})
  .catch((error) => console.error('Error:', error));
}

function removeFromCart(itemId) {
    fetch(`/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        var row = document.getElementById('product-row-' + itemId);
        row.parentNode.removeChild(row);
    })
    .catch((error) => console.error('Error:', error));
}

fetch('/cart/items')
  .then(response => response.json())
  .then(data => {
    const products = data;

    const productRows = products.map(product => `
      <tr id="product-row-${product.itemId}">
        <td>
         ${product.name}
        </td>
        <td id="product-price-${product.itemId}">
         ${product.price}
        </td>
        <td>
          <input type="number" id="productQuantity-${product.itemId}" value="${product.quantity}" onChange="saveChanges('${product.itemId}', {'quantity' : this.value})">
        </td>
        <td id="product-total-${product.itemId}">
          ${product.quantity * product.price}
        </td>
        <td>
        <button type="submit" class = "btn d-flex m-2 py-2 fa-2x" style= "color:rgb(175, 21, 21);text-shadow:2px 2px 4px #9b9b9b;">
            <i class="bi bi-trash" onclick="removeFromCart('${product.itemId}')"></i>
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = productRows;
  })
  .catch(error => console.error('Error:', error));