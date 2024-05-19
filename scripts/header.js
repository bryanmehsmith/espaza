function fetchUnreadNotificationsCount() {
    fetch(`/notifications`)
        .then(response => response.json())
        .then(data => {
            const unreadNotifications = data.filter(notification => notification.isRead === 0);
            const unreadCount = unreadNotifications.length;
            const unreadCountElement = document.getElementById('unreadCount');
            unreadCountElement.textContent = unreadCount;
            if (unreadCount > 0) {
                unreadCountElement.style.display = 'inline-block';
            } else {
                unreadCountElement.style.display = 'none';
            }
        })
        .catch((error) => console.error('Error:', error));
}

fetch('/auth/isLoggedIn')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.querySelector('.bi-person-fill').style.color = 'green';
            document.querySelector('#user-link').href = '/';
            document.querySelector('#user-link').onclick = function() {fetch('/auth/logout')};
            fetch('/users/self/userRole')
                .then(response => {
                    if (!response.ok) {
                        // Public Logic

                    }
                    return response.json();
                })
                .then(data => {
                    // Logged in logic
                    const rolesLogged = ['Admin', 'Staff', 'Shopper'];
                    if (rolesLogged.includes(data.role)) {
                        document.querySelector('#notifications').style.display = 'block';
                        fetchUnreadNotificationsCount();
                        setInterval(fetchUnreadNotificationsCount, 60000);
<<<<<<< HEAD
                        document.querySelector('#cart').href = '/cart';
=======
>>>>>>> d5e0b42058731e97261a3a2510026b5ba991b476
                    }

                    // Internal logic
                    const rolesInternal = ['Admin', 'Staff'];
                    if (rolesInternal.includes(data.role)) {
                        document.querySelector('#internal-link').style.display = 'block';
                    }

                    // Admin logic
                    const rolesAdmin = ['Admin'];
                });
        } else {

        }
    });

<<<<<<< HEAD
    async function searchProd() {
        const apiUrl = '/products';
        let input = document.getElementById('searchbar').value
        input = input.toLowerCase();
        // Fetch products from the backend
        //fetch(`/products`)
        await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
            search: input,
            price: null,
            category: null,
            }),
            headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
        })
        .then(response => response.json())
        .then(data => {
            // Clear data
            document.getElementById('all-products').innerHTML = "";
            document.getElementById('vegetables').innerHTML = "";
            document.getElementById('fruits').innerHTML = "";
            document.getElementById('bread').innerHTML = "";
            document.getElementById('meat').innerHTML = "";
    
            // Loop through the products and display them
            data.items.forEach(product => {
                // Create a new div for the product
                let productDiv = document.createElement('div');
                productDiv.className = 'product col-lg-3';
                let stringData = JSON.stringify(data);
    
                // Add the product details to the div
                productDiv.innerHTML = `
                <div class="rounded position-relative">
                    <div>
                        <img src="../static/images/${product.image}.jpg" class="img-fluid w-100 rounded-top" alt="" width="50" height="50">
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
    }
=======
async function searchProd() {
    const apiUrl = '/products';
    let input = document.getElementById('searchbar').value
    input = input.toLowerCase();
    // Fetch products from the backend
    //fetch(`/products`)
    await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
        search: input,
        price: null,
        category: null,
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    })
    .then(response => response.json())
    .then(data => {
        // Clear data
        document.getElementById('all-products').innerHTML = "";
        document.getElementById('vegetables').innerHTML = "";
        document.getElementById('fruits').innerHTML = "";
        document.getElementById('bread').innerHTML = "";
        document.getElementById('meat').innerHTML = "";

        // Loop through the products and display them
        data.items.forEach(product => {
            // Create a new div for the product
            let productDiv = document.createElement('div');
            productDiv.className = 'product col-lg-3';
            let stringData = JSON.stringify(data);

            // Add the product details to the div
            productDiv.innerHTML = `
            <div class="rounded position-relative">
                <div>
                    <img src="../static/images/${product.image}.jpg" class="img-fluid w-100 rounded-top" alt="" width="50" height="50">
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
}
>>>>>>> d5e0b42058731e97261a3a2510026b5ba991b476
