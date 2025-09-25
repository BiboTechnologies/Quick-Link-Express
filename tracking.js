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
// JS (Assuming Firebase is initialized already)
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
document.getElementById('searchBtn').addEventListener('click', () => {
  const inputIdStr = document.getElementById('searchOrderId').value;  // input is string
  const resultBox = document.getElementById('searchResult');
  const loader = document.getElementById('loader');

  // Clear previous results and show loader
  resultBox.innerHTML = '';
  loader.style.display = 'block';

  if (!inputIdStr) {
    loader.style.display = 'none';
    resultBox.innerHTML = `<p style="color:red; font-weight:bold;">Please enter an order ID.</p>`;
    return;
  }

  const inputIdNum = Number(inputIdStr); // Convert input to number

  if (isNaN(inputIdNum)) {
    loader.style.display = 'none';
    resultBox.innerHTML = `<p style="color:red; font-weight:bold;">Invalid Order ID. Please enter a valid number.</p>`;
    return;
  }

  const ordersRef = ref(db, 'orders');

  get(ordersRef).then(snapshot => {
    let foundOrder = null;
    let orderKey = '';
    
snapshot.forEach(childSnapshot => {
  const order = childSnapshot.val();
  const key = childSnapshot.key;

  // NEW: match even if input is string or number
  if (String(order.orderId) === String(inputIdStr)) {
    foundOrder = order;
    orderKey = key;
  }
});


    loader.style.display = 'none';  // Hide loader

    if (!foundOrder) {
      resultBox.innerHTML = `<p style="color:red; font-weight:bold;">❌ No order found with Order ID: ${inputIdNum}</p>`;
      return;
    }

    // Build transport details HTML if available
    let transportHTML = '<p style="font-style: italic; color: #666;">No transport details found.</p>';
    if (foundOrder.transportDetails) {
      transportHTML = Object.values(foundOrder.transportDetails).map(detail => `
        <div style="padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px; background: #fefefe; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);">
          <p><strong>Driver Name:</strong> ${detail.driverName || 'N/A'}</p>
          <p><strong>Plate Number:</strong> ${detail.plateNumber || 'N/A'}</p>
          <p><strong>Added At:</strong> ${detail.addedAt ? new Date(detail.addedAt).toLocaleString() : 'N/A'}</p>
          ${detail.receiptImage ? `<img src="${detail.receiptImage}" alt="Receipt Image" style="max-width: 100%; height: auto; border-radius: 6px; margin-top: 8px; box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);">` : '<em>No receipt uploaded.</em>'}
        </div>
      `).join('');
    }

    resultBox.innerHTML = `
      <div style="
        max-width: 720px; 
        margin: 20px auto; 
        padding: 25px; 
        background: #fff; 
        border-radius: 10px; 
        box-shadow: 0 4px 12px rgb(0 0 0 / 0.1); 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        color: #333;
      ">
        <h3 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 8px; margin-bottom: 20px;">
          Order Details — <span style="font-weight: normal; color: #555;">Order ID #${foundOrder.orderId}</span>
        </h3>

        <section style="margin-bottom: 25px;">
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Delivery Status</h4>
          <p style="font-size: 16px; font-weight: 600; color: ${getDeliveryStatusColor(foundOrder.deliveryStatus)};">
            ${foundOrder.deliveryStatus || 'IN TRANSIT'}
          </p>
        </section>

        <section style="margin-bottom: 25px;">
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Payment Status</h4>
          <p style="font-size: 16px;">${foundOrder.payment?.status?.toUpperCase() || 'N/A'}</p>
          <p style="font-size: 16px;">Amount Paid: <strong>UGX ${foundOrder.payment?.amount || '0'}</strong></p>
        </section>

        <section style="margin-bottom: 25px;">
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Sender Information</h4>
          <p><strong>Name:</strong> ${foundOrder.sender?.name || '-'}</p>
          <p><strong>Phone:</strong> ${foundOrder.sender?.phone || '-'}</p>
          <p><strong>Address:</strong> ${foundOrder.sender?.address || '-'}</p>
        </section>

        <section style="margin-bottom: 25px;">
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Receiver Information</h4>
          <p><strong>Name:</strong> ${foundOrder.receiver?.name || '-'}</p>
          <p><strong>Phone:</strong> ${foundOrder.receiver?.phone || '-'}</p>
          <p><strong>Address:</strong> ${foundOrder.receiver?.address || '-'}</p>
        </section>

        <section style="margin-bottom: 25px;">
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Parcel Details</h4>
          <p><strong>Description:</strong> ${foundOrder.parcelDetails?.description || '-'}</p>
          <p><strong>Weight:</strong> ${foundOrder.parcelDetails?.weight || '-'} kg</p>
        </section>

        <section style="margin-bottom: 25px;">
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Sent On</h4>
          <p>${new Date(foundOrder.timestamp).toLocaleString()}</p>
        </section>

        <section>
          <h4 style="color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Transport Details</h4>
          ${transportHTML}
        </section>
      </div>
    `;
  }).catch(error => {
    loader.style.display = 'none';
    console.error(error);
    resultBox.innerHTML = `<p style="color:red; font-weight:bold;">Error retrieving order data. Please try again later.</p>`;
  });
});

function getDeliveryStatusColor(status) {
  if (!status) return '#0c71c3'; // default blue for in transit
  const s = status.toLowerCase();
  if (s === 'delivered') return 'green';
  if (s === 'pending') return 'orange';
  if (s === 'cancelled' || s === 'failed') return 'red';
  return '#0c71c3'; // default blue
}
