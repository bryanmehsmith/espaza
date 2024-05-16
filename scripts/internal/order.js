// order.js

function checkoutOrder(userId) {
    fetch(`/order/checkout`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => console.error('Error:', error));
}

function makePayment(orderId) {
    fetch(`/order/checkout/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: 'paid', status: 'packing' }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = "/internal/orderConfirmation";
    })
    .catch((error) => console.error('Error:', error));
}

fetch('/orders/items')
  .then(response => response.json())
  .then(data => {
    const products = data;
    let totalPrice = 0;

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
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = productRows;

    totalPrice = products.reduce(function(result, item){
      return result + item.price * item.quantity;
  }, 0)

  document.getElementById("total").innerHTML = "Total Amout: ZAR" + totalPrice + ".00";
  })
  .catch(error => console.error('Error:', error));