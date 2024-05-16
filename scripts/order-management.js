fetch('/orders')
  .then(response => response.json())
  .then(data => {
    const orders = data;
    let totalPrice = 0;

    const productRows = orders.map(order => `
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
        ${order.status}
       </td>
      </tr>
    `).join('');

    document.querySelector('tbody').innerHTML = productRows;
  })
  .catch(error => console.error('Error:', error));

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