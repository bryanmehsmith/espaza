function submitForm(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productQuantity = document.getElementById('productQuantity').value;
    const price = document.getElementById('price').value;
    const productDescription = document.getElementById('productDescription').value;

    const product = {
        product_name: productName,
        category: productCategory,
        quantity: productQuantity,
        price: price,
        description: productDescription
    };

    fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = "/internal/stock-management";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}