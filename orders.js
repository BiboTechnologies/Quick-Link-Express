
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

              showReceipt(parcelData); // Display the receipt
              parcelForm.reset(); // Reset the form
          })
          .catch((error) => {
              hideLoader(); // Hide loader even if there’s an error
              console.error('Error saving to Firebase:', error);
              alert('There was an error, please try again.');
          });
  });






