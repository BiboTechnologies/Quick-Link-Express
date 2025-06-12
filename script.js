
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { getDatabase, ref, remove, push, get, update, onValue, child, set } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { getAuth, onAuthStateChanged,sendPasswordResetEmail , signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyDSbltKm-73lbDezleJnhrFHL7JkwdmjGY",
    authDomain: "quick-link-85301.firebaseapp.com",
    projectId: "quick-link-85301",
    storageBucket: "quick-link-85301.appspot.com",
    messagingSenderId: "1092968079324",
    appId: "1:1092968079324:web:2be1fed10f97e52708f919",
    measurementId: "G-KHX6V80XJR"
  };

  const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const ordersRef = ref(database, 'orders');


  // Variables to keep track of the order ID
  let currentOrderId = 1;

  // Function to get the current order ID from Firebase
  function getCurrentOrderId() {
      const ordersRef = ref(database, 'orders');
      get(ordersRef).then((snapshot) => {
          if (snapshot.exists()) {
              const orders = snapshot.val();
              const orderIds = Object.keys(orders).map(key => Number(orders[key].orderId));
              currentOrderId = Math.max(...orderIds) + 1; // Increment the highest ID
          }
          document.getElementById('order-id').textContent = currentOrderId;
      }).catch((error) => {
          console.error("Error retrieving order ID:", error);
          document.getElementById('order-id').textContent = "Error";
      });
  }

  // Get current order ID when the page loads
  getCurrentOrderId();


        // Show loader
        function showLoader() {
            document.getElementById('overlay').style.display = 'flex';
        }

        // Hide loader
        function hideLoader() {
            document.getElementById('overlay').style.display = 'none';
        }

        // Show success message
        function showSuccessMessage() {
            const successMessage = document.getElementById('success-message');
            successMessage.style.display = 'block';
            setTimeout(() => successMessage.style.display = 'none', 3000);
        }

      // Function to show the receipt
function showReceipt(parcelData) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Format date as needed

    // Customer Copy
    document.getElementById('receipt-order-id').textContent = parcelData.orderId;
    document.getElementById('receipt-date').textContent = formattedDate;
    document.getElementById('receipt-sender-name').textContent = parcelData.sender.name;
    document.getElementById('receipt-receiver-name').textContent = parcelData.receiver.name;
    document.getElementById('receipt-parcel-desc').textContent = parcelData.parcelDetails.description;
    document.getElementById('receipt-parcel-weight').textContent = parcelData.parcelDetails.weight;
    document.getElementById('receipt-payment-status').textContent = parcelData.payment.status;
    document.getElementById('receipt-amount').textContent = parcelData.payment.amount;

    // Company Copy
    document.getElementById('receipt-order-id-company').textContent = parcelData.orderId;
    document.getElementById('receipt-date-company').textContent = formattedDate;
    document.getElementById('receipt-sender-name-company').textContent = parcelData.sender.name;
    document.getElementById('receipt-receiver-name-company').textContent = parcelData.receiver.name;
    document.getElementById('receipt-parcel-desc-company').textContent = parcelData.parcelDetails.description;
    document.getElementById('receipt-parcel-weight-company').textContent = parcelData.parcelDetails.weight;
    document.getElementById('receipt-payment-status-company').textContent = parcelData.payment.status;
    document.getElementById('receipt-amount-company').textContent = parcelData.payment.amount;

    // Show the modal
    document.getElementById('modal').style.display = 'block';

    // Show the print button
    document.getElementById('print-receipt-btn').style.display = 'block';
}

// Add event listener for the print button
document.getElementById('print-receipt-btn').addEventListener('click', printReceipt);
        
function printReceipt() {
    console.log("Print receipt function called!"); // Debug log

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Receipt</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f8f8f8; /* Optional: Background color */
                    }
                   
         /* Receipt Styles */
#receipt {
    margin: 20px;
    display: none;
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    position: relative;
    max-width: 600px;
    margin: auto;
    font-family: 'Roboto Mono', monospace; /* Use the receipt font */
        }

#receipt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

#receipt-logo {
    width: 150px;
}

#company-details {
    text-align: right;
}

#receipt h3 {
    text-align: center;
    margin: 20px 0;
    color: #333;
    font-size: 1.5em;
    font-weight: bold;
}

#receipt p {
    font-size: 1.1em;
    line-height: 1.6;
    margin: 5px 0;
    color: #555;
}

#company-footer {
    text-align: center;
    margin-top: 30px;
}

#powered-by {
    text-align: right;
    margin-top: 20px;
    font-size: 0.6em;
    color: #777;
}

#powered-by img {
    width: 40px;
    margin-top: 3px;
}

/* Print Styles */
@media print {


    #receipt, #receipt * {
        visibility: visible;
    }

    #receipt {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }
}

                </style>
            </head>
             <body>
                <div class="receipt" id="customer-receipt">
                    ${document.getElementById('receipt-customer').innerHTML}
                </div>
                <div style="height: 20px;"></div> <!-- Adjust height as needed -->
                <div class="receipt" id="company-receipt" style="display: block;">
                    ${document.getElementById('receipt-company').innerHTML}
                </div>
            </body>
        </html>
    `);
   // printWindow.document.close();
    printWindow.print();
    
  // Get current order ID when the page loads
  getCurrentOrderId();

   // printWindow.close();
    closeModal(); // Close modal after printing
}


function closeModal() {
    document.getElementById('modal').style.display = 'none'; // Hide the modal
}



// Form submission handling
const parcelForm = document.getElementById('parcelForm');

parcelForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    // Gather form data
    const senderName = document.getElementById('sender-name').value;
    const senderAddress = document.getElementById('sender-address').value;
    const senderPhone = document.getElementById('sender-phone').value;
    const senderEmail = document.getElementById('sender-email').value;

    const receiverName = document.getElementById('receiver-name').value;
    const receiverAddress = document.getElementById('receiver-address').value;
    const receiverPhone = document.getElementById('receiver-phone').value;
    const receiverEmail = document.getElementById('receiver-email').value;

    const parcelDesc = document.getElementById('parcel-desc').value;
    const parcelWeight = document.getElementById('parcel-weight').value;

    const paymentStatus = document.querySelector('input[name="payment-status"]:checked').value;
    const amount = document.getElementById('amount').value;

    // Structure the data
    const parcelData = {
        orderId: currentOrderId,
        sender: {
            name: senderName,
            address: senderAddress,
            phone: senderPhone,
            email: senderEmail
        },
        receiver: {
            name: receiverName,
            address: receiverAddress,
            phone: receiverPhone,
            email: receiverEmail
        },
        parcelDetails: {
            description: parcelDesc,
            weight: parcelWeight
        },
        payment: {
            status: paymentStatus,
            amount: amount
        },
        timestamp: new Date().toISOString()
    };

      // Save to Firebase
      const ordersRef = ref(database, 'orders');
   push(ordersRef, parcelData)
  .then(() => {
    hideLoader(); // Hide loader after saving
    showSuccessMessage(); // Show success message

    // Get current order ID when the page loads
    getCurrentOrderId();

    // Ask if the user wants to print the receipt
    const shouldPrint = confirm("Order submitted successfully. Do you want to print the receipt?");

    if (shouldPrint) {
      showReceipt(parcelData); // Display the receipt only if user agrees
    }

    parcelForm.reset(); // Reset the form
  })
  .catch((error) => {
    hideLoader(); // Hide loader even if there’s an error
    console.error('Error saving to Firebase:', error);
    alert('There was an error, please try again.');
  });

  });


  onValue(ordersRef, (snapshot) => {
    const ordersTableBody = document.querySelector('#orders-table tbody');
    ordersTableBody.innerHTML = ''; // Clear table
  
    const ordersArray = [];
  
    // Collect all orders into an array
    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
      order._key = childSnapshot.key; // Store Firebase key for later use
      ordersArray.push(order);
    });
  
    // Sort orders by timestamp descending
    ordersArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
    // Render rows
    ordersArray.forEach((order) => {
      const row = document.createElement('tr');
      const status = order.payment.status.toLowerCase();
      const statusColor = status === 'paid' ? 'green-text' : 'red-text';
  
      const deliveryStatus = (order.deliveryStatus || '').toLowerCase();
      const isDelivered = deliveryStatus === 'delivered';
  
      const deliveryHtml = isDelivered
        ? `<span class="delivered">Delivered</span>`
        : `
          <span class="in-progress">
            <span class="orange-ring"></span> In-transit
<button class="mark-delivered icon-button" title="Mark as Delivered" data-id="${order._key}">
  <span class="material-icons">check_circle</span>
</button>
          </span>
        `;
        row.innerHTML = `
        <td>${order.orderId || 'N/A'}</td>
        <td>
          <strong>Name:</strong> ${order.sender.name}<br>
          <strong>Address:</strong> ${order.sender.address}<br>
          <strong>Phone:</strong> ${order.sender.phone}<br>
          <strong>Email:</strong> ${order.sender.email}
        </td>
        <td>
          <strong>Name:</strong> ${order.receiver.name}<br>
          <strong>Address:</strong> ${order.receiver.address}<br>
          <strong>Phone:</strong> ${order.receiver.phone}<br>
          <strong>Email:</strong> ${order.receiver.email}
        </td>
        <td> ${order.parcelDetails.description}</td>
        <td> ${order.parcelDetails.weight}kg(s)</td>
        <td class="${statusColor}">
          <strong>${order.payment.status.toUpperCase()}:</strong> UGX ${order.payment.amount}
          ${status === 'not-paid' ? `<br><button class="pay-button" data-id="${order._key}">Pay</button>` : ''}
        </td>
        <td> ${new Date(order.timestamp).toLocaleString()}</td>
        <td>${deliveryHtml}</td>
      `;
      
      ordersTableBody.appendChild(row);
  

      row.querySelectorAll('.pay-button').forEach(button => {
        button.addEventListener('click', () => {
          const orderId = button.getAttribute('data-id');
          const paymentStatusRef = ref(database, `orders/${orderId}/payment/status`);
          set(paymentStatusRef, 'paid')
            .then(() => {
              alert(`Payment confirmed for order ${orderId}`);
            })
            .catch((error) => {
              console.error('Payment update failed:', error);
              alert('Could not update payment status. Please try again.');
            });
        });
      });
      

      // Add event listener to "Mark as Delivered" buttons
row.querySelectorAll('.mark-delivered').forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.getAttribute('data-id');
      const deliveryRef = ref(database, `orders/${orderId}/deliveryStatus`);
      set(deliveryRef, 'delivered')
        .then(() => {
          alert(`Order ${orderId} marked as delivered`);
        })
        .catch((error) => {
          console.error('Failed to update delivery status:', error);
          alert('Could not update status. Try again.');
        });
    });
  });
  
    });
  });
  


const toggleBtn = document.getElementById('toggle-section-btn');
const section = document.querySelector('.home-section');

toggleBtn.addEventListener('click', () => {
const isHidden = section.style.display === 'none';
section.style.display = isHidden ? 'block' : 'none';
toggleBtn.textContent = isHidden ? 'Close Parcel Panel' : 'Parcel Panel';
});

const orderCountElement = document.getElementById('order-count');

onValue(ordersRef, (snapshot) => {
  const count = snapshot.size; // Gets number of child nodes
  orderCountElement.textContent = count;
});

function animateCountUp(el, target) {
    let current = 0;
    const increment = Math.ceil(target / 50); // speed based on size
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = current;
    }, 20);
  }
  
  onValue(ordersRef, (snapshot) => {
    const count = snapshot.size;
    animateCountUp(orderCountElement, count);
  });
  

  const totalIncomeElement = document.getElementById('total-income');

  onValue(ordersRef, (snapshot) => {
    let total = 0;
  
    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
      const amount = parseFloat(order?.payment?.amount || 0);
      total += amount;
    });
  
    // Format number as UGX currency
    const formatted = new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(total);
  
    totalIncomeElement.textContent = formatted;
  });
  

  const notPaidTotalElement = document.getElementById('not-paid-total');

  onValue(ordersRef, (snapshot) => {
    let unpaidTotal = 0;
  
    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
  
      const status = (order?.payment?.status || '').trim().toLowerCase();
      let amount = order?.payment?.amount;
  
      if (typeof amount === 'string') {
        amount = parseFloat(amount.replace(/[^0-9.]/g, ''));
      } else {
        amount = parseFloat(amount);
      }
  
      if (status === 'not-paid' && !isNaN(amount)) {
        unpaidTotal += amount;
      }
    });
  
    const formattedUnpaid = new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(unpaidTotal);
  
    notPaidTotalElement.textContent = formattedUnpaid;
  });
  
  const todaysIncomeElement = document.getElementById('todays-income');

  let todayTotal = 0;
  
  // Get today's date in local time formatted as YYYY-MM-DD
  const today = new Date();
  const todayDateStr = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  
  // Firebase listener
  onValue(ordersRef, (snapshot) => {
    todayTotal = 0; // reset on new data
  
    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
  
      const status = (order?.payment?.status || '').trim().toLowerCase();
      let amount = order?.payment?.amount;
      const timestamp = order?.timestamp;
  
      if (!timestamp || isNaN(new Date(timestamp))) return;
  
      if (typeof amount === 'string') {
        amount = parseFloat(amount.replace(/[^0-9.]/g, ''));
      } else {
        amount = parseFloat(amount);
      }
  
      const orderDate = new Date(timestamp);
      const orderDateStr = orderDate.getFullYear() + '-' + 
        String(orderDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(orderDate.getDate()).padStart(2, '0');
  
      if (status === 'paid' && orderDateStr === todayDateStr && !isNaN(amount)) {
        todayTotal += amount;
      }
    });
  
    // Format and show result
    const formattedToday = new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(todayTotal);
  
    todaysIncomeElement.textContent = formattedToday;
  });
  




  



"use strict";
class Selectize {
    constructor() {
        this.init();
    }
    init() {
        var initValue;
        $('.action-box').selectric({
            onInit: function (element) {
                initValue = $(this).val();
            },
            onChange: function (element) {
                if ($(this).val() !== initValue)
                    $(element).parents('form').submit();
            }
        });
    }
}
class Charts {
    constructor() {
        this.colors = ["#DB66AE", "#8185D6", "#89D9DF", "#E08886"];
        this.tickColor = "#757681";
        this.initRadar();
        this.initBarHorizontal();
        this.initDoughnut();
    }
    initRadar() {
        var ctxD = $('#radarChartDark'), chartData = {
            type: 'radar',
            data: {
                labels: ["Education", "Food", "Transport", "Drinks", "Other"],
                datasets: [
                    {
                        label: "2014",
                        backgroundColor: this.convertHex(this.colors[0], 20),
                        borderColor: this.colors[0],
                        borderWidth: 1,
                        pointRadius: 2,
                        data: [51, 67, 90, 31, 16],
                    },
                    {
                        label: "2015",
                        backgroundColor: this.convertHex(this.colors[1], 20),
                        borderColor: this.colors[1],
                        borderWidth: 1,
                        pointRadius: 2,
                        data: [75, 44, 19, 22, 43],
                    },
                    {
                        label: "2015",
                        backgroundColor: this.convertHex(this.colors[2], 20),
                        borderColor: this.colors[2],
                        borderWidth: 1,
                        pointRadius: 2,
                        data: [7, 14, 29, 82, 33]
                    }
                ]
            },
            options: {
                scale: {
                    pointLabels: {
                        fontColor: this.tickColor
                    },
                    ticks: {
                        display: false,
                        stepSize: 25
                    }
                },
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 11,
                        fontColor: this.tickColor,
                        fontSize: 11
                    }
                }
            }
        }, myDarkRadarChart = new Chart(ctxD, chartData);
    }
    initBarHorizontal() {
        var ctxD = $("#barChartHDark"), chartData = {
            type: 'horizontalBar',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                        data: [27, 59, 68, 26, 79, 55, 36, 43, 44, 30, 55, 64],
                        backgroundColor: this.colors[0],
                        hoverBackgroundColor: this.convertHex(this.colors[0], 70)
                    },
                    {
                        data: [136, 23, 44, 30, 79, 55, 61, 94, 27, 59, 98, 91],
                        backgroundColor: this.colors[1],
                        hoverBackgroundColor: this.convertHex(this.colors[1], 70)
                    },
                    {
                        data: [88, 31, 87, 61, 77, 27, 59, 58, 136, 26, 79, 85],
                        backgroundColor: this.colors[2],
                        hoverBackgroundColor: this.convertHex(this.colors[2], 70)
                    }]
            },
            options: {
                barThickness: 10,
                scales: {
                    xAxes: [{
                            stacked: true,
                            ticks: {
                                fontColor: this.tickColor,
                            },
                            gridLines: {
                                drawOnChartArea: false
                            }
                        }],
                    yAxes: [{
                            stacked: true,
                            ticks: {
                                fontColor: this.tickColor,
                                min: 0,
                                max: 175,
                                stepSize: 25
                            }
                        }]
                },
                legend: {
                    display: false
                }
            }
        }, myDarkRadarChart = new Chart(ctxD, chartData);
    }
    initDoughnut() {
        var ctxD = $('#doughnutChartDark'), chartData = {
            type: 'doughnut',
            data: {
                labels: ["Brasil", "India", "China"],
                datasets: [{
                        data: [300, 50, 100],
                        borderWidth: 0,
                        backgroundColor: [
                            this.convertHex(this.colors[0], 60),
                            this.convertHex(this.colors[1], 60),
                            this.convertHex(this.colors[2], 60),
                        ],
                        hoverBackgroundColor: [
                            this.colors[0],
                            this.colors[1],
                            this.colors[2],
                        ]
                    }]
            },
            options: {
                responsive: true,
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 11,
                        fontColor: this.tickColor,
                        fontSize: 11
                    }
                }
            }
        }, myDarkRadarChart = new Chart(ctxD, chartData);
    }
    convertHex(hex, opacity) {
        hex = hex.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
        return result;
    }
}
new Selectize();
new Charts();
