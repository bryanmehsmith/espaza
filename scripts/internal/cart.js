function addToCart(userId, itemId) {
    fetch(`/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, itemId: itemId, quantity: 1 }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        location.reload();
    })
    .catch((error) => console.error('Error:', error));
}

function removeFromCart(userId, itemId) {
    fetch(`/cart/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, itemId: itemId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        location.reload();
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
        <td>
         ${product.price}
        </td>
        <td>
          ${product.quantity}
        </td>
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = productRows;
  })
  .catch(error => console.error('Error:', error));