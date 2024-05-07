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
        fetch(`/order/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemId: items.id, totalPrice: items.bill }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            const orderId = data.orderId;

            // Add items to an order
            items.slice(1).forEach(item => {
                fetch(`/order/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderId: orderId, itemId: item.id, quantity: item.quantity, price: item.price }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => console.error('Error:', error));
            });

            window.location.href = "/internal/checkout";
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