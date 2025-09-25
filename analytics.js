import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSbltKm-73lbDezleJnhrFHL7JkwdmjGY",
    authDomain: "quick-link-85301.firebaseapp.com",
    projectId: "quick-link-85301",
    storageBucket: "quick-link-85301.appspot.com",
    messagingSenderId: "1092968079324",
    appId: "1:1092968079324:web:2be1fed10f97e52708f919",
    measurementId: "G-KHX6V80XJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const orderTableBody = document.querySelector("#orderTable tbody");

// Fetch orders from Firebase
function fetchOrders() {
    const ordersRef = ref(database, "orders"); // Replace "orders" with your database path
    onValue(ordersRef, (snapshot) => {
        orderTableBody.innerHTML = ""; // Clear table before appending new data
        if (snapshot.exists()) {
            const orders = snapshot.val();
            Object.keys(orders).forEach((key) => {
                const order = orders[key];
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${key}</td>
                    <td>${order.parcelDetails.description}</td>
                    <td>${order.parcelDetails.weight}</td>
                    <td>${order.payment.amount}</td>
                    <td>${order.payment.status}</td>
                    <td>${order.receiver.name}</td>
                    <td>${order.receiver.phone}</td>
                    <td>${order.receiver.address}</td>
                    <td>${order.sender.name}</td>
                    <td>${order.sender.phone}</td>
                    <td>${order.sender.address}</td>
                    <td>${new Date(order.timestamp).toLocaleString()}</td>
                    <td><button class="action-button" onclick="viewOrder('${key}')">View</button></td>
                `;
                orderTableBody.appendChild(row);
            });
        } else {
            orderTableBody.innerHTML = "<tr><td colspan='13'>No orders found</td></tr>";
        }
    });
}

// View order details
window.viewOrder = (orderId) => {
    alert(`Viewing details for Order ID: ${orderId}`);
    // You can implement modal or redirect functionality to show detailed order view
};

fetchOrders();
