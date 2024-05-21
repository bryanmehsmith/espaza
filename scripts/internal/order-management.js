function updateOrderStatus(orderId, status) {
    fetch(`/orders/update/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        document.querySelector(`#product-row-${orderId} td:nth-child(5)`).textContent = status;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  
}

document.querySelector('.btn.btn-primary').addEventListener('click', function() {
  // Assuming the order id is stored in a data attribute on the modal
  const orderId = document.querySelector('#staticBackdrop').dataset.orderId;

  // Get the selected status from the dropdown
  const status = document.querySelector('#orderStatus').value;

  updateOrderStatus(orderId, status);
});

fetch('/orders')
  .then(response => response.json())
  .then(data => {
    const orders = data;
    let totalPrice = 0;

    const productRows = orders.map(order => {
      const statuses = ['Packing', 'Processing', 'Ready for collection', 'Collected'];
      const statusOptions = statuses.map(status => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`).join('');
      return `
      <tr id="product-row-${order.id}">
        <td>
         #${order.id}
        </td>
        <td>
         ${order.date}
        </td>
        <td>
          ${order.paymentStatus}
        </td>
        <td>
         ${order.totalPrice}
        </td>
        <td>
          <select id="orderStatus-${order.id}" onchange="updateOrderStatus(${order.id}, this.value)">
            ${statusOptions}
          </select>
        </td>
      </tr>
    `}).join('');

    document.querySelector('tbody').innerHTML = productRows;

    //reporting
  $(document).ready(function(){
    $("#ordersTable").DataTable({
        dom: 'Bfrtip',
        buttons:[
            'copyHtml5',
            'excelHtml5',
            'csvHtml5',
            'pdfHtml5'
        ]
    })
  })

  })

  .catch(error => console.error('Error:', error));