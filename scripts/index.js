
function addToCart(userId, itemId) {
    fetch(`/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, itemId: itemId, quantity: 1 }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => console.error('Error:', error));
}

// Fetch products from the backend
fetch('/products')
.then(response => response.json())
.then(data => {
    // Loop through the products and display them
    data.products.forEach(product => {
        // Create a new div for the product
        let productDiv = document.createElement('div');
        productDiv.className = 'product col-lg-3';
        let stringData = JSON.stringify(data);

        // Add the product details to the div
        productDiv.innerHTML = `
        <div class="rounded position-relative">
            <div>
                <img src="/${product.image}" class="img-fluid w-100 rounded-top" alt="" width="50" height="50">
            </div>
            <div class="text-white bg-danger px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${product.category}</div>
            <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="d-flex justify-content-between flex-lg-wrap">
                    <p class="text-dark fs-5 fw-bold mb-0">R${product.price} / kg</p>
                    <button type="button" style="width: 100%;" class="btn btn-warning mt-auto shop-item-button" onclick="addToCart('${data.userId}', '${product.id}')"><i class="fa-solid fa-cart-shopping " style="margin-right: 4%;"></i>Add To Cart</button>
                </div>
            </div>
        </div>
        `;

        // Add the product to the "all-products" div
        document.getElementById('all-products').appendChild(productDiv);

        // Add the product to its category div
        switch (product.category.toLowerCase()) {
            case 'vegetables':
                document.getElementById('vegetables').appendChild(productDiv.cloneNode(true));
                break;
            case 'fruits':
                document.getElementById('fruits').appendChild(productDiv.cloneNode(true));
                break;
            case 'bread':
                document.getElementById('bread').appendChild(productDiv.cloneNode(true));
                break;
            case 'meat':
                document.getElementById('meat').appendChild(productDiv.cloneNode(true));
                break;
         }
    });
})
.catch((error) => console.error('Error:', error));