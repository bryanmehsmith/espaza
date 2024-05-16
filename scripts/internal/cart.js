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

function removeFromCart(itemId) {
    fetch(`/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        location.reload();
    })
    .catch((error) => console.error('Error:', error));
}

function getData(){
  const url1 = "/orders/create";
  //const url2 = "/cart/items";
  //const url3 = "/orders/add";

  //const responses = await Promise.all([fetch(url1), fetch(url2)])

  const responses1 = fetch(url1, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});
/*  const responses2 = await fetch(url2, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
 });*/

  const data1 = responses1.json()
 // const data2 = await responses2.json()

  let orderId = data1;
  let items = data2;
  

  /*const response3 = await fetch(url3)
  const data3 = await response1.json()*/
            // Add items to an order

  /*const it = async forEach.map(item => {
    response3 = await fetch(url3)
  });*/
          // Add items to an order
  /*const itemPromises = items.map(item => {
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
  })*/
}

async function createOrder() {
  // Fetch the items from the cart
  await fetch(`/cart/items`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
  })
  .then(response => response.json())
  .then(data => async() => {
      const items = data;

      // Create an order
      await fetch(`/orders/create`, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
      })
      .then(response => response.json())
      .then(data1 => {
          const orderId = data1.orderId;

          // Add items to an order
          const itemPromises = items.map(item => async() =>{
              return await fetch(`/orders/add`, {
                  method: 'POST',
                  headers: {
                      'Accept': 'application/json',
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

fetch('/cart/items')
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
        <td>
        <button type="submit" class = "btn d-flex m-2 py-2 fa-2x" style= "color:rgb(175, 21, 21);text-shadow:2px 2px 4px #9b9b9b;">
            <i class="bi bi-trash" onclick="removeFromCart('${product.itemId}')"></i>
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = productRows;

    totalPrice = products.reduce(function(result, item){
        return result + item.price * item.quantity;
    }, 0)

    document.getElementById("price").innerHTML = "Total Amout: ZAR" + totalPrice;
  })
  .catch(error => console.error('Error:', error));