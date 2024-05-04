// Fetch products from the backend
fetch('/products', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => {
    // Loop through the products and display them
    data.forEach(product => {
        // Create a new div for the product
        let productDiv = document.createElement('div');
        productDiv.className = 'product';

        // Add the product details to the div
        productDiv.innerHTML = `
            <div class="rounded position-relative">
                <div>
                    <img src="${product.image}" class="img-fluid w-100 rounded-top" alt="">
                </div>
                <div class="text-white bg-danger px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${product.category}</div>
                <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="d-flex justify-content-between flex-lg-wrap">
                        <p class="text-dark fs-5 fw-bold mb-0">${product.price}</p>
                        <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary"><i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart</a>
                    </div>
                </div>
            </div>
        `;

        // Add the product div to the correct category div
        document.getElementById(product.category).appendChild(productDiv);
    });
})
.catch((error) => console.error('Error:', error));