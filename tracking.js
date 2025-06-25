import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { getDatabase, ref,query, orderByChild,equalTo, remove, push, get, update, onValue, child, set } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
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
const db = getDatabase(app);
const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');

const resultBox = document.getElementById('trackingResult');

if (!orderId) {
  resultBox.innerHTML = `<p class="not-found">❌ No order ID provided in URL.</p>`;
} else {
  const ordersRef = ref(db, 'orders');

  onValue(ordersRef, (snapshot) => {
    let found = false;
    snapshot.forEach(childSnapshot => {
      const order = childSnapshot.val();
      const key = childSnapshot.key;

      if ((order.orderId || key) === orderId) {
        found = true;
        resultBox.innerHTML = generateOrderHTML(order, key);
      }
    });

    if (!found) {
      resultBox.innerHTML = `<p class="not-found">❌ Parcel not found with ID: <strong>${orderId}</strong></p>`;
    }
  });
}

function generateOrderHTML(order, key) {
  const transportSection = order.transportDetails
    ? Object.entries(order.transportDetails).map(([id, detail]) => {
        return `
          <div class="section">
            <h5>Transport Info</h5>
            <p><strong>Driver Name:</strong> ${detail.driverName || 'Not provided'}</p>
            <p><strong>Plate Number:</strong> ${detail.plateNumber || 'Not provided'}</p>
            <p><strong>Added At:</strong> ${new Date(detail.addedAt).toLocaleString()}</p>
            ${detail.receiptImage ? `
              <p><strong>Receipt:</strong><br>
                <img src="${detail.receiptImage}" alt="Receipt Image" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 5px; margin-top: 5px;">
              </p>
            ` : '<p>No receipt uploaded.</p>'}
          </div>
        `;
      }).join('')
    : '<div class="section"><h5>Transport Info</h5><p>No transport details available.</p></div>';

  return `
    <div class="status-box">
      <div class="section">
        <h5>Status</h5>
        <p><strong>Delivery:</strong> ${order.deliveryStatus || 'IN TRANSIT'}</p>
        <p><strong>Order ID:</strong> ${order.orderId || key}</p>
      </div>

      <div class="section">
        <h5>Sender</h5>
        <p><strong>Name:</strong> ${order.sender.name}</p>
        <p><strong>Phone:</strong> ${order.sender.phone}</p>
        <p><strong>Address:</strong> ${order.sender.address || 'N/A'}</p>
      </div>

      <div class="section">
        <h5>Receiver</h5>
        <p><strong>Name:</strong> ${order.receiver.name}</p>
        <p><strong>Phone:</strong> ${order.receiver.phone}</p>
        <p><strong>Address:</strong> ${order.receiver.address || 'N/A'}</p>
      </div>

      <div class="section">
        <h5>Parcel Info</h5>
        <p><strong>Description:</strong> ${order.parcelDetails.description}</p>
        <p><strong>Weight:</strong> ${order.parcelDetails.weight} kg</p>
      </div>

      <div class="section">
        <h5>Payment</h5>
        <p><strong>Status:</strong> ${order.payment?.status?.toUpperCase() || 'N/A'}</p>
        <p><strong>Amount:</strong> UGX ${order.payment?.amount || 'N/A'}</p>
      </div>

      <div class="section">
        <h5>Timestamp</h5>
        <p><strong>Date Sent:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
      </div>

      ${transportSection}
    </div>
  `;
}
