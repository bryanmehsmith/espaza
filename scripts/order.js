// order.js

function createOrder() {
    // Fetch the items from the cart
    fetch(`/cart/items`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        const items = data;

        // Create an order
        fetch(`/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data1 => {
            const orderId = data1.orderId;

            // Add items to an order
            const itemPromises = items.map(item => {
                return fetch(`/orders/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderId: orderId, itemId: item.id, quantity: item.quantity, price: item.price }),
                })
                .then(response => response.json())
                .then(data2 => {
                    console.log('Success:', data2);
                })
                .catch((error) => console.error('Error:', error));
            });

            Promise.all(itemPromises)
            .then(() => {
                window.location.href = "/internal/checkout";
            })
            .catch((error) => console.error('Error:', error));
        })
        .catch((error) => console.error('Error:', error));
    })
    .catch((error) => console.error('Error:', error));
}

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
  })
  .catch(error => console.error('Error:', error));