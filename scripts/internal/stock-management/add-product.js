function submitForm(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productQuantity = document.getElementById('productQuantity').value;
    const price = document.getElementById('price').value;
    const productDescription = document.getElementById('productDescription').value;
    const productImage = document.getElementById('formFile').files[0];

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('category', productCategory);
    formData.append('quantity', productQuantity);
    formData.append('price', price);
    formData.append('description', productDescription);
    formData.append('formFile', productImage);

    fetch('/products', {
        method: 'POST',
        body: formData,
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