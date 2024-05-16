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

function removeFromCart(itemId) {
    fetch(`/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        location.reload();
    })
    .catch((error) => console.error('Error:', error));
}

function createOrder(){
  const url1 = "/orders/create";

  const responses1 = fetch(url1, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

  const data1 = responses1.json()
}

fetch('/cart/items')
  .then(response => response.json())
  .then(data => {
    const products = data;
    let totalPrice = 0.00;

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
        <td>
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

    totalPrice = products.reduce(function(result, item){
        return result + item.price * item.quantity;
    }, 0)

    document.getElementById("price").innerHTML = "Total Amout: ZAR" + totalPrice.toString() + ".00";
  })
  .catch(error => console.error('Error:', error));