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

fetch(`/orders/create`)
.then(response => response.json())
.then(data => {
    console.log('Success:', data);
    orderId = data.id;
    makePayment(orderId)
})
.catch((error) => console.error('Error:', error));