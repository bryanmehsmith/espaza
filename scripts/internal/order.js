// orders.js

function createOrder(userId, itemId, quantity, shippingAddress) {
    fetch(`/orders/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, itemId: itemId, quantity: quantity, shippingAddress: shippingAddress }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        orderId = data.id;
    })
    .catch((error) => console.error('Error:', error));
}

function checkoutOrder(userId) {
    fetch(`/orders/checkout`, {
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
    fetch(`/orders/checkout/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: 'paid', status: 'packing' }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => console.error('Error:', error));
}