
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { getDatabase,  ref as dbRef, remove, push, get, update, onValue, child, set } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { getAuth, onAuthStateChanged,sendPasswordResetEmail , signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyAisBpwnYt14S4NiLbcOiAhdINsqwSYJiI",
  authDomain: "aleveltv-75194.firebaseapp.com",
  databaseURL: "https://aleveltv-75194-default-rtdb.firebaseio.com",
  projectId: "aleveltv-75194",
  storageBucket: "aleveltv-75194.appspot.com",
  messagingSenderId: "440342498130",
  appId: "1:440342498130:web:20e2eb670b1cb2c39cc88b",
  measurementId: "G-VTR1KGT4CW"
  };

  const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const ordersRef = dbRef(database, 'orders');



async function getCurrentOrderId(retryInterval = 500) {
  const ordersRef = dbRef(database, 'orders');
  let currentOrderId;

  while (true) { // retry until successful
    try {
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();

        // Extract numeric orderIds
        const orderIds = Object.values(orders)
          .map(o => Number(o.orderId))
          .filter(n => !isNaN(n));

        if (orderIds.length > 0) {
          currentOrderId = Math.max(...orderIds) + 1; // next available ID
        } else {
          currentOrderId = 1;
        }
      } else {
        currentOrderId = 1;
      }

      document.getElementById('order-id').textContent = currentOrderId;
      return currentOrderId;
    } catch (error) {
      console.error("Error retrieving order ID, retrying...", error);
      await new Promise(res => setTimeout(res, retryInterval));
    }
  }
}

// Run when page loads
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
      const ordersRef = dbRef(database, 'orders');
   push(ordersRef, parcelData)
  .then(() => {
    hideLoader(); // Hide loader after saving
    showSuccessMessage(); // Show success message

    // Get current order ID when the page loads
    getCurrentOrderId();

    // Ask if the user wants to print the receipt
   // const shouldPrint = confirm("Order submitted successfully. Do you want to print the receipt?");

   // if (shouldPrint) {
   //   showReceipt(parcelData); // Display the receipt only if user agrees
   // }

    parcelForm.reset(); // Reset the form
  })
  .catch((error) => {
    hideLoader(); // Hide loader even if there’s an error
    console.error('Error saving to Firebase:', error);
    alert('There was an error, please try again.');
  });

  });

let ordersArray = []; // Declare globally so both onValue and button can access it

onValue(ordersRef, (snapshot) => {
  const ordersTableBody = document.querySelector('#orders-table tbody');
  ordersTableBody.innerHTML = ''; // Clear table

  ordersArray = []; // Reset before filling it again

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
        </td>
        <td>
          <strong>Name:</strong> ${order.receiver.name}<br>
          <strong>Address:</strong> ${order.receiver.address}<br>
          <strong>Phone:</strong> ${order.receiver.phone}<br>
        </td>
        <td> ${order.parcelDetails.description}</td>
        <td> ${order.parcelDetails.weight}kg(s)</td>
        <td class="${statusColor}">
          <strong>${order.payment.status.toUpperCase()}:</strong> UGX ${order.payment.amount}
          ${status === 'not-paid' ? `<br><button class="pay-button" data-id="${order._key}">Pay</button>` : ''}
        </td>
        <td> ${new Date(order.timestamp).toLocaleString()}</td>


        <td>${deliveryHtml}</td>
<td>
  <button class="print-receipt-btn styled-btn" data-id="${order._key}">🖨️ Print</button>
  <button class="view-details-btn styled-btn view-btn" data-id="${order._key}">👁️ View Details</button>
</td>



      `;
      
      ordersTableBody.appendChild(row);
 row.querySelectorAll('.print-receipt-btn').forEach(button => {
  button.addEventListener('click', () => {
    const orderId = button.getAttribute('data-id');
    const order = ordersArray.find(o => o._key === orderId);
    const receiptNo = order.orderId || order._key;
    const trackingNo = order._key;

const trackingLink = `https://bibotechnologies.github.io/Quick-Link-Express/tracking.html?orderId=${receiptNo}`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Parcel Ticket - KWIK LINK XPRESS</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 30px;
              color: #2c3e50;
              background-color: #fff;
            }
            .copy {
              margin-bottom: 40px;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 3px solidrgb(255, 0, 0);
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header img {
              height: 150px;
            }
            .header-text {
              flex-grow: 1;
              text-align: center;
            }
            .header-text h2 {
              margin: 0;
              font-size: 26px;
              color:rgb(228, 0, 0);
              text-transform: uppercase;
            }
            .ticket-title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              color: #000;
              margin: 10px 0 20px;
              padding: 5px;
              border-top: 1px dashed #333;
              border-bottom: 1px dashed #333;
            }
            .section {
              margin-bottom: 20px;
              border: 1px solid #e0e0e0;
              border-left: 5px solid #007bff;
              padding: 10px 15px;
              border-radius: 4px;
              background-color: #f9f9f9;
            }
            .section h3 {
              margin-top: 0;
              color:rgb(228, 0, 0);
              font-size: 16px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 4px;
              text-transform: uppercase;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-weight: bold;
              font-size: 14px;
              color: #333;
            }
            .footer span {
              display: block;
              font-size: 12px;
              font-weight: normal;
              color: #777;
            }
            .barcode, .qrcode {
              text-align: center;
              margin-top: 20px;
            }
            .divider {
              border-top: 2px dashed #999;
              margin: 40px 0;
              text-align: center;
              position: relative;
            }
            .divider:after {
              content: 'CUT HERE';
              position: absolute;
              background: #fff;
              padding: 0 10px;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #555;
            }
          </style>
        </head>
        <body>
${generateTicketHTML(receiptNo, order, trackingLink, 'Customer Copy', trackingNo)}
          <div class="divider"></div>
${generateTicketHTML(receiptNo, order, trackingLink, 'Office Copy', trackingNo)}

          <script>
            JsBarcode(".barcode-img", "${receiptNo}", {
              format: "CODE128",
              displayValue: true,
              lineColor: "#000",
              fontSize: 14,
              height: 50,
              margin: 5
            });

            new QRious({
              element: document.getElementById("qr-${receiptNo}"),
              value: "${trackingLink}",
              size: 100,
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  });
});
function generateTicketHTML(receiptNo, order, trackingLink, copyLabel, trackingNo) {
  return `
    <div class="copy">
      <div class="header">
        <img src="kwik-link-xpress-high-resolution-logo.png" alt="KWIK LINK Logo">
        <div class="header-text">
          <h2>KWIKLINK XPRESS </h2>
          <p>Plot 12, Luwum Street, Kampala, Uganda</p>
          <p>+256 754 142039 | +256 702 587589</p>
          <p>info@kwiklinkxpress.com</p>
        </div>
      </div>

      <div class="ticket-title">📦 PARCEL TICKET — <em>${copyLabel}</em></div>

      <p><strong>Receipt Number:</strong> ${receiptNo}</p>
<p><strong>Tracking Number:</strong> ${trackingNo.slice(-5)}</p>

      <div class="section">
        <h3>Sender</h3>
        <p>
          <strong>Name:</strong> ${order.sender.name}<br>
          <strong>Address:</strong> ${order.sender.address}<br>
          <strong>Phone:</strong> ${order.sender.phone}
        </p>
      </div>

      <div class="section">
        <h3>Receiver</h3>
        <p>
          <strong>Name:</strong> ${order.receiver.name}<br>
          <strong>Address:</strong> ${order.receiver.address}<br>
          <strong>Phone:</strong> ${order.receiver.phone}
        </p>
      </div>

      <div class="section">
        <h3>Parcel Details</h3>
        <p>
          <strong>Description:</strong> ${order.parcelDetails.description}<br>
          <strong>Weight:</strong> ${order.parcelDetails.weight} kg
        </p>
      </div>

      <div class="section">
        <h3>Payment & Status</h3>
        <p>
          <strong>Status:</strong> ${order.payment.status.toUpperCase()}<br>
          <strong>Amount Paid:</strong> UGX ${order.payment.amount}<br>
          <strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}
        </p>
      </div>

      <div class="barcode">
        <svg class="barcode-img"></svg>
      </div>
      <div class="qrcode">
        <canvas id="qr-${receiptNo}"></canvas>
        <p style="font-size: 12px; color: #555;">Scan to track your parcel</p>
      </div>

      <div class="footer">
        Thank you for choosing KWIK LINK XPRESS
        <span>This receipt was auto-generated. No signature required.</span>
      </div>
    </div>
  `;
}


      row.querySelectorAll('.pay-button').forEach(button => {
        button.addEventListener('click', () => {
          const orderId = button.getAttribute('data-id');
          const paymentStatusRef = dbRef(database, `orders/${orderId}/payment/status`);
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
document.querySelectorAll('.view-details-btn').forEach(button => {
  button.addEventListener('click', () => {
    const orderId = button.getAttribute('data-id');
    const order = ordersArray.find(o => o._key === orderId);

    const detailsRef = dbRef(database, `orders/${orderId}/transportDetails`);
    get(detailsRef).then(snapshot => {
      let content = '';

      if (snapshot.exists()) {
        const data = snapshot.val();
        content = '<h4><i class="fas fa-truck"></i> Transport Details:</h4>';

        Object.entries(data).forEach(([key, detail]) => {
          const companyName = "KwikLink Xpress";
          const companyContact = "+256754152039";

          const destination = order.receiver.address || "Not set";
          const receiverName = order.receiver.name || "Not set";
          const customerName = order.sender.name || "Not set";

          const items = Array.isArray(order.parcelDetails.description)
            ? order.parcelDetails.description.join(", ")
            : (order.parcelDetails.description || "Not set");

          const receiptLink = detail.receiptImage ? detail.receiptImage : "";

          // Build WhatsApp message (emojis)
          const message = encodeURIComponent(
            `🌟 *Hello Mr/Mrs. ${customerName || ''}!* 👋\n\n` +
            `✅ Here are your delivery details from *${companyName}*:\n\n` +
            `📄 *Order Details:*\n` +
            `🏠 Destination: ${destination}\n` +
            `👤 Receiver: ${receiverName}\n` +
            `📦 Items: ${items}\n\n` +
            `🚚 *Transport Details:*\n` +
            `🧑‍✈️ Driver: ${detail.driverName || 'Not set'}\n` +
            `🚗 Plate Number: ${detail.plateNumber || 'Not set'}\n` +
            (receiptLink ? `🧾 Receipt: ${receiptLink}\n` : '') +
            `⏰ Added At: ${new Date(detail.addedAt).toLocaleString()}\n\n` +
            `🙏 *Thank you for choosing ${companyName}!* 💖\n` +
            `📞 For assistance, contact us at ${companyContact}.`
          );

          // Clean and format sender phone number
          let senderPhone = (order.sender.phone || "").replace(/\D/g, "");
          if (senderPhone.startsWith("0")) {
            // Local format (e.g., 0700...)
            senderPhone = "256" + senderPhone.substring(1);
          } else if (!senderPhone.startsWith("256")) {
            // Missing country code entirely
            senderPhone = "256" + senderPhone;
          }

          const whatsappUrl = `https://wa.me/${senderPhone}?text=${message}`;

          // Build HTML preview
          content += `
            <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:5px;">
              <p><i class="fas fa-id-card"></i> <strong>Driver:</strong> ${detail.driverName || 'Not set'}</p>
              <p><i class="fas fa-car"></i> <strong>Plate Number:</strong> ${detail.plateNumber || 'Not set'}</p>
              ${receiptLink ? `
                <p><i class="fas fa-receipt"></i> <strong>Receipt:</strong><br>
                  <img src="${receiptLink}" 
                       style="width:300px; height:auto; border:1px solid #ccc; border-radius:5px; display:block; margin-top:8px;">
                  <a href="${receiptLink}" 
                     download="receipt-${orderId}-${key}.jpg"
                     style="display:inline-block; margin-top:8px; color:#1a73e8; text-decoration:underline;">
                    <i class="fas fa-download"></i> Download Receipt
                  </a>
                </p>
              ` : '<p><i class="fas fa-ban"></i> No receipt uploaded.</p>'}
              <p><i class="fas fa-clock"></i> <em>Added at: ${new Date(detail.addedAt).toLocaleString()}</em></p>

              <button class="editDetailBtn" data-key="${key}"
                style="background-color:#e67e22; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer;">
                ✏️ Edit This Detail
              </button>

              <a href="${whatsappUrl}" target="_blank"
                style="display:inline-block; margin-top:8px; background-color:#25D366; color:white; padding:6px 12px; border-radius:5px; text-decoration:none;">
                <i class="fab fa-whatsapp"></i> Message Sender on WhatsApp
              </a>
            </div>
          `;
        });



        // Store data reference for use in event listeners
        const detailsData = data;

        document.getElementById('viewModalHeader').textContent = `Details for This Order: ${order.sender.name} → ${order.receiver.name}`;
        document.getElementById('viewDetailsContent').innerHTML = content;
        document.getElementById('viewDetailsModal').style.display = 'block';

        // Attach event listeners to all edit buttons
        document.querySelectorAll('.editDetailBtn').forEach(editBtn => {
          editBtn.addEventListener('click', () => {
            const detailKey = editBtn.getAttribute('data-key');
            const detailData = detailsData[detailKey];

            // Close the details view modal
            document.getElementById('viewDetailsModal').style.display = 'none';

            // Prefill the edit form with existing data
            document.getElementById('detailsOrderId').value = orderId;
            document.getElementById('driverName').value = detailData.driverName || '';
            document.getElementById('plateNumber').value = detailData.plateNumber || '';

            // Save the key being edited for updating later
            document.getElementById('detailsModal').setAttribute('data-edit-key', detailKey);

            // Update modal header text
            document.getElementById('modalOrderHeader').textContent = `Edit Transport Detail for Order: ${order.sender.name} → ${order.receiver.name}`;

            // Show the edit modal
            document.getElementById('detailsModal').style.display = 'block';
          });
        });

      } else {
        // No transport details found for this order
        content = `
          <p>No details found for this order.</p>
          <button id="editDetailsBtn" style="background-color: #3498db; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
            ➕ Add Details
          </button>
        `;

        document.getElementById('viewModalHeader').textContent = `Details for This Order: ${order.sender.name} → ${order.receiver.name}`;
        document.getElementById('viewDetailsContent').innerHTML = content;
        document.getElementById('viewDetailsModal').style.display = 'block';

        // Handle Add Details button
        const addBtn = document.getElementById('editDetailsBtn');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            document.getElementById('viewDetailsModal').style.display = 'none';
            document.getElementById('detailsOrderId').value = orderId;

            // Clear edit key since this is a new entry
            document.getElementById('detailsModal').removeAttribute('data-edit-key');

            // Clear form inputs
            document.getElementById('driverName').value = '';
            document.getElementById('plateNumber').value = '';

            document.getElementById('modalOrderHeader').textContent = `Add Transport Detail for Order: ${order.sender.name} → ${order.receiver.name}`;
            document.getElementById('detailsModal').style.display = 'block';
          });
        }
      }
    });
  });
});
document.getElementById('cancelTransportBtn').addEventListener('click', () => {
  // Hide the details modal
  document.getElementById('detailsModal').style.display = 'none';

  // Clear the edit key attribute to reset the form state
  document.getElementById('detailsModal').removeAttribute('data-edit-key');

  // Clear input fields
  document.getElementById('driverName').value = '';
  document.getElementById('plateNumber').value = '';
});


document.querySelectorAll('.add-details-btn').forEach(button => {
  button.addEventListener('click', () => {
    const orderId = button.getAttribute('data-id');
    const order = ordersArray.find(o => o._key === orderId);

    // Update form hidden value and show modal
    document.getElementById('detailsOrderId').value = orderId;

    // Set dynamic header
    const headerText = `Add Details for This Order: ${order.sender.name} → ${order.receiver.name}`;
    document.getElementById('modalOrderHeader').textContent = headerText;

    document.getElementById('detailsModal').style.display = 'block';
    console.log(orderId)
  });
});

      // Add event listener to "Mark as Delivered" buttons
row.querySelectorAll('.mark-delivered').forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.getAttribute('data-id');
      const deliveryRef = dbRef(database, `orders/${orderId}/deliveryStatus`);
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
  
document.getElementById('showRevenueBtn').addEventListener('click', () => {
  let totalRevenue = 0;
  const dailyStats = {}; // date => { revenue, count }

  ordersArray.forEach((order) => {
    const status = order.payment.status.toLowerCase();
    if (status === 'paid') {
      const amount = Number(order.payment.amount);
      totalRevenue += amount;

      const date = new Date(order.timestamp).toISOString().split('T')[0];

      if (!dailyStats[date]) {
        dailyStats[date] = { revenue: 0, count: 0 };
      }

      dailyStats[date].revenue += amount;
      dailyStats[date].count += 1;
    }
  });

  const companyLogo = "kwik-link-xpress-high-resolution-logo.png"; // Replace with your logo URL
  const generatedAt = new Date().toLocaleString();

const breakdownRows = Object.keys(dailyStats)
  .sort()
  .map(
    (date, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : '#fff'};">
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${date}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">UGX ${dailyStats[date].revenue.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${dailyStats[date].count} order(s)</td>
      </tr>
    `
  )
  .join('');


  const reportHtml = `
<div style="font-family: Arial; max-width: 800px; margin: auto;">
  <div style="display: flex; align-items: center; gap: 20px;">
    <img src="${companyLogo}" alt="Company Logo" style="height: 80px;">
    
    <div style="text-align: left;">
      <h2 style="margin: 0;">KWIK LINK XPRESS </h2>
      <p style="margin: 2px 0;">
        Plot 12, Luwum Street, Kampala, Uganda<br>
        Tel: +256 754 142039 | Email: info@snrxpress.com
      </p>
    </div>

  </div>
</div>

      <hr style="margin: 15px 0;">
      <h3 style="text-align: center;">Revenue Report</h3>
      <p><strong>Generated At:</strong> ${generatedAt}</p>
      <p><strong>Total Revenue (Paid Orders):</strong> UGX ${totalRevenue.toLocaleString()}</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px;">
  <thead style="background-color: #004080; color: white;">
    <tr>
      <th style="text-align: left; padding: 10px; border-bottom: 2px solid #004080;">Date</th>
      <th style="text-align: right; padding: 10px; border-bottom: 2px solid #004080;">Amount (UGX)</th>
      <th style="text-align: center; padding: 10px; border-bottom: 2px solid #004080;"># of Orders</th>
    </tr>
  </thead>
  <tbody>
    ${breakdownRows}
  </tbody>
</table>


      <p style="margin-top: 30px; font-size: 0.9em; text-align: center;">
        Thank you for choosing SNR XPRESS LTD. Fast and Timely.
      </p>
    </div>
  `;

  //document.getElementById('revenueReport').innerHTML = reportHtml;

  const win = window.open('', '_blank');
  win.document.write(`
    <html>
      <head>
        <title>SNR XPRESS LTD - Revenue Report</title>
      </head>
      <body>
        ${reportHtml}
      </body>
    </html>
  `);
  win.document.close();
  win.print();
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
  
// Place this once, not inside any function that runs repeatedly
document.getElementById('saveTransportBtn').addEventListener('click', saveTransportDetails);

async function saveTransportDetails() {
  const orderId = document.getElementById('detailsOrderId').value;
  const driverName = document.getElementById('driverName').value.trim();
  const plateNumber = document.getElementById('plateNumber').value.trim();
  const receiptFile = document.getElementById('receiptImage').files[0]; // optional

  if (!orderId || !driverName || !plateNumber) {
    alert("Please fill in all required fields.");
    return;
  }

  const saveBtn = document.getElementById('saveTransportBtn');
  saveBtn.disabled = true;

  try {
    let receiptUrl = '';

    // Upload receipt if file is selected
    if (receiptFile) {
const storagePath = storageRef(storage, `receipts/${orderId}/${receiptFile.name}`);
const snapshot = await uploadBytes(storagePath, receiptFile);

      receiptUrl = await getDownloadURL(snapshot.ref);
    }

    const dataToSave = {
      driverName,
      plateNumber,
      addedAt: new Date().toISOString(),
    };

    if (receiptUrl) {
      dataToSave.receiptImage = receiptUrl;
    }

    // Check if editing existing detail
    const editKey = document.getElementById('detailsModal').getAttribute('data-edit-key');

    if (editKey) {
      // Update existing detail
      const detailRef = dbRef(database, `orders/${orderId}/transportDetails/${editKey}`);
      await set(detailRef, dataToSave);
      alert("Details updated successfully.");
      document.getElementById('detailsModal').removeAttribute('data-edit-key');
    } else {
      // Add new detail
      const detailsRef = dbRef(database, `orders/${orderId}/transportDetails`);
      await push(detailsRef, dataToSave);
      alert("Details saved successfully.");
    }

    // Reset form and close modal
    document.getElementById('driverName').value = '';
    document.getElementById('plateNumber').value = '';
    document.getElementById('receiptImage').value = '';
    document.getElementById('detailsModal').style.display = 'none';

  } catch (error) {
    console.error("Error saving transport details:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    saveBtn.disabled = false;
  }
}


const senderList = document.getElementById("sender-list");
const receiverList = document.getElementById("receiver-list");

const senderName = document.getElementById("sender-name");
const senderAddress = document.getElementById("sender-address");
const senderPhone = document.getElementById("sender-phone");
const senderEmail = document.getElementById("sender-email");

const receiverName = document.getElementById("receiver-name");
const receiverAddress = document.getElementById("receiver-address");
const receiverPhone = document.getElementById("receiver-phone");
const receiverEmail = document.getElementById("receiver-email");

let senders = {};
let receivers = {};

// Load orders and extract sender/receiver info
onValue(dbRef(database, 'orders'), snapshot => {
  senders = {};
  receivers = {};
  senderList.innerHTML = '';
  receiverList.innerHTML = '';

  snapshot.forEach(child => {
    const order = child.val();

    if (order.sender?.name) {
      senders[order.sender.name] = order.sender;
      if (!senderList.querySelector(`option[value="${order.sender.name}"]`)) {
        senderList.innerHTML += `<option value="${order.sender.name}">`;
      }
    }

    if (order.receiver?.name) {
      receivers[order.receiver.name] = order.receiver;
      if (!receiverList.querySelector(`option[value="${order.receiver.name}"]`)) {
        receiverList.innerHTML += `<option value="${order.receiver.name}">`;
      }
    }
  });
});

// Auto-fill sender details
senderName.addEventListener('change', () => {
  const data = senders[senderName.value];
  if (data) {
    senderAddress.value = data.address || '';
    senderPhone.value = data.phone || '';
    senderEmail.value = data.email || '';
  }
});

// Auto-fill receiver details
receiverName.addEventListener('change', () => {
  const data = receivers[receiverName.value];
  if (data) {
    receiverAddress.value = data.address || '';
    receiverPhone.value = data.phone || '';
    receiverEmail.value = data.email || '';
  }
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
