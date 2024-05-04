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