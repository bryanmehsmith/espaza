function saveChanges(itemId, payload) {
  fetch(`/cart/${itemId}`, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    var totalCell = document.getElementById('product-total-' + itemId);

    var priceCell = document.getElementById("price");
    var totalAllPrice = Number(priceCell.innerHTML.replace("Total Amount: ZAR", "").replace(".00", "")) - Number(totalCell.textContent);
    totalAllPrice = totalAllPrice + Number(payload.quantity * document.getElementById('product-price-' + itemId).textContent);
    priceCell.innerHTML = "Total Amount: ZAR" + totalAllPrice.toString() + ".00";

    totalCell.textContent = payload.quantity * document.getElementById('product-price-' + itemId).textContent;
})
  .catch((error) => console.error('Error:', error));
}

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
      location.reload();
  })
  .catch((error) => console.error('Error:', error));
}

function removeFromCart(itemId) {
  fetch(`/cart/${itemId}`, {
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

function createOrder(){
const url1 = "/orders/create";

const responses1 = fetch(url1, {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
  }
});

const data1 = responses1.json()
}

fetch('/cart/items')
.then(response => response.json())
.then(data => {
  const products = data;
  let totalPrice = 0.00;

  const productRows = products.map(product => `
      <tr id="product-row-${product.itemId}">
        <td>
         ${product.name}
        </td>
        <td id="product-price-${product.itemId}">
         ${product.price}
        </td>
        <td>
          <input type="number" id="productQuantity-${product.itemId}" value="${product.quantity}" onChange="saveChanges('${product.itemId}', {'quantity' : this.value})">
        </td>
        <td id="product-total-${product.itemId}">
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

  document.getElementById("price").innerHTML = "Total Amount: ZAR" + totalPrice.toString() + ".00";

  // Get the purchase button
  let purchaseButton = document.getElementById('btn-purchase');

  // Check if products array is empty
  if (products.length === 0) {
      // If it's empty, hide the purchase button
      purchaseButton.hidden = true;
  } else {
      // If it's not empty, show the purchase button
      purchaseButton.hidden = false;
  }
})
.catch(error => console.error('Error:', error));