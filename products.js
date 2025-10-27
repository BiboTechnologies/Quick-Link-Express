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
const auth = getAuth(app);
const storage = getStorage(app);
 const db = getDatabase(app);
  const dbRef = ref(db);
// ====================== GLOBAL VARIABLES ======================
let products = [];
let cart = {};
let searchTimeout;
// ====================== FETCH PRODUCTS ======================
async function fetchProductsFromFirebase() {
  products = []; // reset before reload

  try {
    const snapshot = await get(child(dbRef, 'products'));

    if (!snapshot.exists()) {
      console.warn("⚠️ No products found in Firebase.");
      return false;
    }

    const data = snapshot.val();

    // ✅ Flatten and sanitize products for consistent cart keys
    for (const key in data) {
      const p = data[key];
      if (p && p.name && p.price !== undefined) {
        const safeKey = getSafeName(p.name); // <== 🔑 same sanitizer used in cart logic

        products.push({
          id: key,
          name: p.name.trim(),
          key: safeKey,        // ✅ store sanitized key for direct addToCart use
          price: parseInt(p.price) || 0,
          description: p.description || '',
          category: p.category || '',
          image: p.image || ''
        });
      }
    }

    console.log(`✅ Loaded ${products.length} products.`);
    return true;
  } catch (error) {
    console.error("🚨 Error fetching products:", error);
    return false;
  }
}


// ====================== INITIALIZE ======================
async function initApp() {
  const loader = document.getElementById('loaderOverlay');
  loader.classList.remove('hidden');

  console.log("⏳ Fetching products...");

  try {
    const loaded = await fetchProductsFromFirebase();

    if (loaded && products.length > 0) {
      console.log("✅ Products ready — attaching search input listener...");
      attachSearchListener();

      // hide loader smoothly
      setTimeout(() => loader.classList.add('hidden'), 500);
    } else {
      console.error("❌ Could not load products. Retrying in 2s...");
      loader.querySelector('p').textContent = 'Retrying... please wait';
      setTimeout(initApp, 2000);
    }
  } catch (error) {
    console.error("🚨 Error initializing app:", error);
    loader.querySelector('p').textContent = 'Error loading data. Retrying...';
    setTimeout(initApp, 2000);
  }
}

// ====================== SEARCH HANDLER ======================
function attachSearchListener() {
  const searchInput = document.getElementById('searchInput');
  const dropdown = document.getElementById('dropdown');

  searchInput.addEventListener('input', function () {
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = this.value.trim().toLowerCase();
      dropdown.innerHTML = '';

      if (!query) {
        dropdown.style.display = 'none';
        return;
      }

      // ✅ Prevent searching empty data
      if (!Array.isArray(products) || products.length === 0) {
        console.warn("⚠️ No products loaded yet.");
        dropdown.style.display = 'none';
        return;
      }

      const matches = products.filter(p =>
        p.name && p.name.toLowerCase().includes(query)
      );

      dropdown.style.display = matches.length ? 'block' : 'none';

      if (matches.length === 0) {
        const noMatch = document.createElement('div');
        noMatch.classList.add('dropdown-item');
        noMatch.textContent = 'No matching products found.';
        dropdown.appendChild(noMatch);
        return;
      }

      matches.forEach(product => {
        const div = document.createElement('div');
        div.classList.add('dropdown-item');
        div.textContent = `${product.name} - UGX ${formatNumberWithCommas(product.price)}`;
        div.addEventListener('click', () => {
          addToCart(product);
          searchInput.value = '';
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(div);
      });
    }, 150); // debounce delay
  });
}


// ====================== START APP ======================
initApp();




// ===================== CART STATE =====================
const cartTableBody = document.querySelector('#cartTable tbody');
const overallTotalSpan = document.getElementById('overallTotal');

// ===================== HELPERS =====================
function getSafeName(name) {
  return name.replace(/\W+/g, '_');
}

function formatNumberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ===================== ADD TO CART =====================
function addToCart(product) {
  const safeKey = getSafeName(product.name);

  if (!cart[safeKey]) {
    cart[safeKey] = { ...product, qty: 1 };
  } else {
    cart[safeKey].qty += 1;
  }

  renderCart();
}

// ===================== REMOVE FROM CART =====================
function removeFromCart(safeKey) {
  if (cart[safeKey]) {
    delete cart[safeKey];
    renderCart();
  }
}

// ===================== UPDATE TOTAL =====================
function updateOverallTotal() {
  let total = 0;
  for (const key in cart) {
    total += cart[key].price * cart[key].qty;
  }
  overallTotalSpan.textContent = `UGX ${formatNumberWithCommas(total)}`;
}

// ===================== RENDER CART =====================
function renderCart() {
  cartTableBody.innerHTML = '';

  for (const key in cart) {
    const item = cart[key];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td><input type="number" min="1" value="${item.qty}" class="qty-input" data-key="${key}" style="width:60px;"></td>
      <td>UGX ${formatNumberWithCommas(item.price)}</td>
      <td>UGX ${formatNumberWithCommas(item.qty * item.price)}</td>
      <td><button class="delete-btn" data-key="${key}">🗑️</button></td>
    `;
    cartTableBody.appendChild(row);
  }

  updateOverallTotal();
}

// ===================== EVENT LISTENERS =====================
cartTableBody.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const key = e.target.dataset.key;
    removeFromCart(key);
  }
});

cartTableBody.addEventListener('input', e => {
  if (e.target.classList.contains('qty-input')) {
    const key = e.target.dataset.key;
    const newQty = parseInt(e.target.value);
    if (cart[key] && newQty > 0) {
      cart[key].qty = newQty;
      renderCart();
    }
  }


  if (e.target.classList.contains('price-input')) {
    const price = parseInt(e.target.value);
    if (price >= 0) cart[key].price = price;
  }

  renderCart();
  updateOverallTotal();
});

// ✅ Handle delete button
cartTableBody.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const key = e.target.dataset.key;
    removeFromCart(key);
  }
});





























// ===================== CART LOGIC =====================

// Listen for delete, qty, and price changes
cartTableBody.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const name = e.target.dataset.name;
    delete cart[name];
    
    renderCart();
    updateOverallTotal(); // refresh totals
  }
});

cartTableBody.addEventListener('input', e => {
  const name = e.target.dataset.name;
  if (!name || !cart[name]) return;

  if (e.target.classList.contains('qty-input')) {
    const qty = parseInt(e.target.value) || 0;
    if (qty > 0) {
      cart[name].qty = qty;
      updateRowTotal(name);
      updateOverallTotal();
    }
  }

  if (e.target.classList.contains('price-input')) {
    const price = parseInt(e.target.value) || 0;
    if (price >= 0) {
      cart[name].price = price;
      updateRowTotal(name);
      updateOverallTotal();
    }
  }
});


// --- Update a single item's total ---
function updateRowTotal(name) {
  const item = cart[name];
  const totalCell = document.getElementById(`total-${CSS.escape(name)}`);
  if (totalCell) {
    const total = item.qty * item.price;
    totalCell.textContent = `${formatNumberWithCommas(total)}`;

    // Highlight animation
    totalCell.classList.add('updated');
    setTimeout(() => totalCell.classList.remove('updated'), 300);
  }
}



// ===================== ANIMATION STYLE =====================
const style = document.createElement('style');
style.textContent = `
  .updated {
    background-color: #fffbcc;
    transition: background-color 0.3s ease;
  }
`;
document.head.appendChild(style);

// ===================== PRINT RECEIPT =====================
document.getElementById('printBtn').addEventListener('click', () => {
  const cartRows = cartTableBody.querySelectorAll('tr');
  const now = new Date();
  const dateStr = now.toLocaleString();
  const customerName = document.getElementById('customerName')?.value || '---';
  const customerDestination = document.getElementById('customerDestination')?.value || '---';
  const receiptNumber = generateReceiptNumber ? generateReceiptNumber() : `REC-${Date.now()}`;

  let itemsHTML = '';
  let grandTotal = 0;

  cartRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 4) return;

    const name = cells[0].textContent.trim();
    const qty = Number(cells[1].querySelector('input')?.value || cells[1].textContent.trim());
    const price = Number(cells[2].querySelector('input')?.value || cells[2].textContent.replace(/,/g, ''));
    const total = qty * price;
    grandTotal += total;

    itemsHTML += `<tr>
      <td>${name}</td>
      <td>${qty}</td>
      <td>${price.toLocaleString()}</td>
      <td>${total.toLocaleString()}</td>
    </tr>`;
  });

  const receiptHTML = `
<html>
  <head>
    <title>KWIKLINK XPRESS Receipt</title>
    <style>
      body { 
        font-family: 'Courier New', monospace; 
        width: 320px; 
        margin: 0 auto; 
        padding: 10px; 
        color: #000;
      }
      .logo { text-align: center; margin-bottom: 5px; }
      .logo img { width: 85px; height: auto; }
      h2, p { text-align: center; margin: 2px 0; }
      .company { font-size: 11px; text-align: center; margin-bottom: 8px; }
      .customer { font-size: 12px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 6px; }
      thead tr { border-bottom: 1px dashed #000; }
      th, td { padding: 2px 0; }
      th.item, td.item { width: 50%; }
      th.qty, td.qty { width: 10%; text-align: center; }
      th.price, td.price { width: 20%; text-align: right; }
      th.total, td.total { width: 20%; text-align: right; }
      tfoot td { border-top: 2px solid #000; font-weight: bold; }
      .grand-total { text-align: right; font-weight: bold; }
      .footer { text-align: center; font-size: 11px; margin-top: 10px; }
    </style>
  </head>
  <body>
    <div class="logo">
      <img src="kwik-link-transparent.png" alt="KWIKLINK XPRESS">
    </div>
    <h2>KWIKLINK XPRESS</h2>
    <div class="company">
      <p>Temusewo Mpoza Lv2 Shop 311, Kampala, Uganda</p>
      <p>Tel: +256 702 587589 | Email: info@kwiklinkxpress.com</p>
      <p>Website: www.kwiklinkxpress.com</p>
    </div>
    <div class="customer">
      <p><strong>Receipt #: </strong>${receiptNumber}</p>
      <p><strong>Date:</strong> ${dateStr}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Destination:</strong> ${customerDestination}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th class="item">Item</th>
          <th class="qty">Qty</th>
          <th class="price">Price</th>
          <th class="total">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="grand-total">Grand Total:</td>
          <td>${grandTotal.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p>KWIKLINK XPRESS</p>
      <p>www.kwiklinkxpress.com | +256 742 108061</p>
    </div>
  </body>
</html>
`;

  const printWindow = window.open('', '', 'width=400,height=600');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.print();
});

// ===================== INITIAL LOAD =====================
renderCart();
updateOverallTotal();

  document.addEventListener('click', function (e) {
    if (!dropdown.contains(e.target) && e.target !== searchInput) {
      dropdown.style.display = 'none';
    }
  });



const saveBtn = document.getElementById('saveProduct');

saveBtn.addEventListener('click', () => {
  const category = document.getElementById('productCategory').value;
  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);

  // Basic validation
  if (!category || !name || !description || isNaN(price) || price < 0) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Prepare product object
  const newProduct = {
    category,
    name,
    description,
    price,
    createdAt: Date.now()
  };

  // Reference to products node
  const productsRef = ref(db, 'products');

  // Push new product
  push(productsRef, newProduct)
    .then(() => {
      alert("Product saved successfully!");
      fetchProductsFromFirebase();

      // Optionally reset form inputs:
      document.getElementById('productCategory').value = "";
      document.getElementById('productName').value = "";
      document.getElementById('productDescription').value = "";
      document.getElementById('productPrice').value = "";
      
      // Close modal if you want:
      document.getElementById('productModal').style.display = 'none';
    })
    .catch(error => {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    });
});

   const addProductBtn = document.getElementById('addProductBtn');
    const modal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');

    addProductBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Optional: You can now use this button to collect or submit product data
    document.getElementById('saveProduct').addEventListener('click', () => {
      const product = {
        products: document.getElementById('productSubCategory').value,
        category: document.getElementById('productCategory').value,
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value,
        price: document.getElementById('productPrice').value,
        wholesalePrice: document.getElementById('productWholesalePrice').value
      };

      console.log("Saved Product:", product);
      alert("Product saved (see console)");
      modal.style.display = 'none';
    });


   const cartDate = document.getElementById("cartDate");
const today = new Date();

const formattedDate = today.toLocaleDateString("en-GB", {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

const formattedTime = today.toLocaleTimeString("en-GB", {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

cartDate.textContent = `🗓️ ${formattedDate} ⏰ ${formattedTime}`;




function generateOrderId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${dateStr}-${randomDigits}`;
}

const orderId = generateOrderId();
orderIdDisplay.textContent = `| Order ID: ${orderId}`;



document.getElementById('saveReceiptBtn').addEventListener('click', () => {
  const customerName = document.getElementById('customerName').value.trim();
  const destination = document.getElementById('customerDestination').value.trim();

  if (!customerName || !destination) {
    alert("Please enter both customer name and destination.");
    return;
  }

  const receiptItems = Object.values(cart).map(item => ({
    name: item.name,
    qty: item.qty,
    price: item.price,
    total: item.qty * item.price
    
  }));

  if (receiptItems.length === 0) {
    alert("Cart is empty. Please add items before saving.");
    return;
  }

  const overallTotal = receiptItems.reduce((sum, item) => sum + item.total, 0);
  const createdAt = Date.now();

  // Generate unique receipt number
  const dateStr = new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  const receiptNumber = `REC-${dateStr}-${randomNum}`;

  const receiptData = {
    receiptNumber,
    customerName,
    destination,
    items: receiptItems,
    totalAmount: overallTotal,
    createdAt
  };

  // Save to Firebase
  const receiptsRef = ref(db, 'receipts');
  const newReceiptRef = push(receiptsRef);
  set(newReceiptRef, receiptData)
    .then(() => {
     
      alert(`Receipt saved successfully!\nReceipt Number: ${receiptNumber}`);
loadAllReceipts()
      // Clear form
      cartTable.innerHTML = '';
      document.getElementById('overallTotal').textContent = '0';
      document.getElementById('customerName').value = '';
      document.getElementById('customerDestination').value = '';
      Object.keys(cart).forEach(key => delete cart[key]);
    })
    .catch(error => {
      console.error("Error saving receipt:", error);
      alert("Failed to save receipt. Please try again.");
    });
});



function calculateOverallTotal() {
  return Object.values(cart).reduce((sum, item) => sum + (item.qty * item.price), 0);
}
function printReceipt() {
  const printWindow = window.open('', '_blank');
  const dateStr = new Date().toLocaleString();
  const itemsHtml = Object.values(cart).map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>UGX ${item.price.toLocaleString()}</td>
      <td>UGX ${(item.qty * item.price).toLocaleString()}</td>
    </tr>
  `).join('');

  const receiptHtml = `
    <html>
    <head>
      <title>Receipt</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
      <h2>KWIKLINK XPRESS  Receipt</h2>
      <p><strong>Date:</strong> ${dateStr}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${document.getElementById('customerName').value}</p>
      <p><strong>Destination:</strong> ${document.getElementById('customerDestination').value}</p>
      <table>
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <h3>Total: UGX ${calculateOverallTotal().toLocaleString()}</h3>
    </body>
    </html>
  `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  printWindow.print();
}
document.addEventListener("DOMContentLoaded", function () {
  const orderIdDisplay = document.getElementById("orderIdDisplay");

  if (orderIdDisplay) {
    const orderId = generateOrderId();
    orderIdDisplay.textContent = `| Order ID: ${orderId}`;
  }
});
let currentReceiptId = null;



const receiptSearchInput = document.getElementById('receiptSearchInput');
const customerNameInput = document.getElementById('customerName');
const customerDestinationInput = document.getElementById('customerDestination');

receiptSearchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    const receiptNumber = receiptSearchInput.value.trim();
    if (!receiptNumber) {
      alert('Please enter a receipt number.');
      return;
    }

    // Clear previous data
    customerNameInput.value = '';
    customerDestinationInput.value = '';
    cartTableBody.innerHTML = '';
    overallTotalSpan.textContent = '0';

    // Show loading text in table
    cartTableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    // Query Firebase for receipt with matching receiptNumber
    const receiptsRef = ref(db, 'receipts');
    const q = query(receiptsRef, orderByChild('receiptNumber'), equalTo(receiptNumber));

get(q)
  .then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const receiptKey = Object.keys(data)[0];
      const receipt = data[receiptKey];

      // Fill customer info inputs
      customerNameInput.value = receipt.customerName || '';
      customerDestinationInput.value = receipt.destination || '';

      // Clear existing cart data first
      Object.keys(cart).forEach(key => delete cart[key]);

      // Populate cart object with receipt items
      if (receipt.items && receipt.items.length > 0) {
        receipt.items.forEach(item => {
          cart[item.name] = {
            name: item.name,
            qty: item.qty,
            price: item.price
          };
        });

        // Use your existing renderCart() to update UI
        renderCart();
      } else {
        // If no items, clear table & total
        cartTableBody.innerHTML = '<tr><td colspan="5">No items found for this receipt.</td></tr>';
        overallTotalSpan.textContent = '0';
      }
    } else {
      cartTableBody.innerHTML = '<tr><td colspan="5">No receipt found with that number.</td></tr>';
      overallTotalSpan.textContent = '0';
      customerNameInput.value = '';
      customerDestinationInput.value = '';
    }
  })
  .catch(error => {
    console.error('Error fetching receipt:', error);
    cartTableBody.innerHTML = '<tr><td colspan="5">Error fetching receipt data. Try again.</td></tr>';
    overallTotalSpan.textContent = '0';
    customerNameInput.value = '';
    customerDestinationInput.value = '';
  });

  }
});
function loadReceiptIntoCart(receipt) {
  // Clear existing cart first
  Object.keys(cart).forEach(key => delete cart[key]);

  // Add receipt items to cart object
  receipt.items.forEach(item => {
    cart[item.name] = {
      name: item.name,
      qty: item.qty,
      price: item.price
    };
  });

  // Render the cart table using your existing renderCart()
  renderCart();

  // Optionally update customer info inputs
  document.getElementById('customerName').value = receipt.customerName || '';
  document.getElementById('customerDestination').value = receipt.destination || '';
}


let receiptList = [];
let currentIndex = -1;
let firstLoadComplete = false;

function loadAllReceipts(retryCount = 0) {
  const receiptsRef = ref(db, 'receipts');

  get(receiptsRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        handleReceipts(snapshot.val());
        firstLoadComplete = true;
        // ✅ Once loaded, start continuous updates
        listenForReceipts();
      } else {
        console.warn("No receipts found yet. Retrying...");
        retryLoad(retryCount);
      }
    })
    .catch(error => {
      console.error("Error loading receipts:", error);
      retryLoad(retryCount);
    });

  function retryLoad(retryCount) {
    if (!firstLoadComplete) {
      const delay = 1000 * Math.min(30, Math.pow(2, retryCount)); 
      // exponential backoff, capped at 30s
      console.log(`Retrying in ${delay / 1000}s...`);
      setTimeout(() => loadAllReceipts(retryCount + 1), delay);
    }
  }
}

function listenForReceipts() {
  const receiptsRef = ref(db, 'receipts');

  onValue(receiptsRef, (snapshot) => {
    if (snapshot.exists()) {
      handleReceipts(snapshot.val());
    } else {
      console.warn("Receipts list is empty.");
    }
  }, (error) => {
    console.error("Error listening for receipts:", error);
  });
}

function handleReceipts(data) {
  receiptList = [];

  Object.entries(data).forEach(([id, receiptData]) => {
    receiptList.push({ id: id, data: receiptData });
  });

  if (currentIndex === -1 && receiptList.length > 0) {
    currentIndex = 0;
    populateReceipt(receiptList[currentIndex].data, receiptList[currentIndex].id);
  }

  console.log(`Receipts loaded/updated. Total: ${receiptList.length}`);
}

// Call this on page load
loadAllReceipts();


function bindCartInputEvents() {
  const qtyInputs = document.querySelectorAll('.qty-input');
  const priceInputs = document.querySelectorAll('.price-input');

  qtyInputs.forEach(input => {
    input.addEventListener('input', updateItemTotal);
  });

  priceInputs.forEach(input => {
    input.addEventListener('input', updateItemTotal);
  });
}

// Attach one listener to the entire table body
cartTableBody.addEventListener('input', function (e) {
  if (e.target.classList.contains('qty-input') || e.target.classList.contains('price-input')) {
    updateItemTotal(e.target);
  }
});

function updateItemTotal(element) {
  const row = element.closest('tr');
  const safeName = element.dataset.name;
  const qtyInput = row.querySelector('.qty-input');
  const priceInput = row.querySelector('.price-input');
  const totalCell = document.getElementById(`total-${safeName}`);

  const qty = parseFloat(qtyInput.value) || 0;
  const price = parseFloat(priceInput.value) || 0;
  const total = qty * price;

  if (totalCell) {
    totalCell.textContent = `UGX ${formatNumberWithCommas(total)}`;
  }

  updateOverallTotal();
}
cartTableBody.addEventListener('input', function (e) {
  if (e.target.classList.contains('qty-input') || e.target.classList.contains('price-input')) {
    updateItemTotal(e.target);
  }
});




function populateReceipt(receipt, receiptId = '') {
  cart = {}; // Clear previous cart items

  currentReceiptId = receiptId;

  // Fill customer inputs
  customerNameInput.value = receipt.customerName || '';
  customerDestinationInput.value = receipt.destination || '';
  cartTableBody.innerHTML = '';

// Suppose currentIndex and receiptList are available in scope
const totalReceipts = receiptList.length;
const currentPos = currentIndex + 1; // +1 because arrays start at 0

const createdAtDate = receipt.createdAt 
  ? new Date(receipt.createdAt).toLocaleString() 
  : 'No creation date';

const displayText = receipt.receiptNumber
  ? `Receipt Number: ${receipt.receiptNumber} | Created At: ${createdAtDate} | ${currentPos} of ${totalReceipts}`
  : `Created At: ${createdAtDate} | ${currentPos} of ${totalReceipts}`;

document.getElementById('orderIdDisplay').textContent = displayText;


if (receipt.items && receipt.items.length > 0) {
  cart = {}; // ✅ Clear the cart to avoid accumulation

  receipt.items.forEach(item => {
    
    cart[item.name] = {
      name: item.name,
      qty: item.qty || 0,
      price: item.price || 0
    };
  });

  renderCart(); // Redraw UI using updated cart
} else {
  cart = {}; // ✅ Also clear the cart when no items
  cartTableBody.innerHTML = '<tr><td colspan="5">No items found for this receipt.</td></tr>';
  overallTotalSpan.textContent = '0';
}



  // Optional: reflect in search field
  receiptSearchInput.value = receipt.receiptNumber || '';
}

function updateNavButtons() {
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= receiptList.length;
  jumpToLatestBtn.disabled = currentIndex >= receiptList.length - 1;

}

nextBtn.addEventListener('click', () => {
  if (receiptList.length === 0) {
    clearReceiptInputs();
    currentIndex = 0;
    updateNavButtons();
    return;
  }

  if (currentIndex < receiptList.length - 1) {
    currentIndex++;
    const currentReceipt = receiptList[currentIndex];
    populateReceipt(currentReceipt.data, currentReceipt.id);
  } else if (currentIndex === receiptList.length - 1) {
    // Reached last item — now move to "new receipt" mode
    currentIndex++;
    clearReceiptInputs(); // simulate new receipt
  }

  updateNavButtons();
});
const jumpToLatestBtn = document.getElementById('jumpToLatestBtn');

jumpToLatestBtn.addEventListener('click', async () => {
  // If the list is empty, try to fetch receipts first
  if (!receiptList || receiptList.length === 0) {
    await fetchReceipts(); // <--- make sure this function loads receiptList
  }

  if (receiptList.length === 0) {
    clearReceiptInputs();
    currentIndex = 0;
    showMessage("No receipts found.");
    updateNavButtons();
    return;
  }

  // Jump to the last (latest) receipt
  currentIndex = receiptList.length - 1;
  const latestReceipt = receiptList[currentIndex];
  populateReceipt(latestReceipt.data, latestReceipt.id);

  updateNavButtons();
});


prevBtn.addEventListener('click', () => {
  if (receiptList.length === 0 || currentIndex <= 0) {
    currentIndex = 0;
    updateNavButtons();
    return;
  }

  currentIndex--;

  if (currentIndex < receiptList.length) {
    const currentReceipt = receiptList[currentIndex];
    populateReceipt(currentReceipt.data, currentReceipt.id);
  }

  updateNavButtons();
});

// Call this once when initializing
updateNavButtons();


function generateNewReceiptNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
  const randomPart = Math.floor(Math.random() * 90000) + 10000; // random 5-digit number
  return `REC-${datePart}-${randomPart}`;
}


function clearReceiptInputs() {
  customerNameInput.value = '';
  customerDestinationInput.value = '';
  cartTableBody.innerHTML = '<tr><td colspan="5">New receipt - add items</td></tr>';
  overallTotalSpan.textContent = '0';

  // Generate new receipt number
  const newReceiptNumber = generateNewReceiptNumber();
  receiptSearchInput.value = newReceiptNumber;

  // Display the new receipt number
  document.getElementById('orderIdDisplay').textContent = `Receipt Number: ${newReceiptNumber}`;
  
  // Optionally reset current receipt ID if you track it
  currentReceiptId = null;
}




document.getElementById('saveChangesBtn').addEventListener('click', () => {
  // Your logic to save changes to the current receipt
  saveChanges();
});

function saveChanges() {
  if (!currentReceiptId) {
    alert("No receipt selected to save.");
    return;
  }

  // Build updated items array
  const updatedItems = [];
  const rows = cartTableBody.querySelectorAll("tr");

  rows.forEach(row => {
    const name = row.querySelector("input.qty-input")?.dataset.name;
    if (!name) return; // skip if no item name

    const qtyInput = row.querySelector("input.qty-input");
    const priceInput = row.querySelector("input.price-input");

    const qty = Number(qtyInput.value) || 0;
    const price = Number(priceInput.value) || 0;

    if (qty > 0 && price >= 0) {
      updatedItems.push({ name, qty, price });
    }
  });

  // Calculate new total amount
  const totalAmount = updatedItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  // Prepare update object
  const updates = {
    items: updatedItems,
    totalAmount,
  };

  // Update Firebase receipt node
  const receiptRef = ref(db, `receipts/${currentReceiptId}`);

  update(receiptRef, updates)
    .then(() => {
      alert("Receipt updated successfully!");
      // Optionally update local receiptList and re-render
      if (receiptList[currentIndex]) {
        receiptList[currentIndex].data.items = updatedItems;
        receiptList[currentIndex].data.totalAmount = totalAmount;
      }
      populateReceipt(receiptList[currentIndex].data, currentReceiptId);
    })
    .catch(error => {
      console.error("Error updating receipt:", error);
      alert("Failed to update receipt. Check console for details.");
    });
}

function generateReceiptNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
  const randomPart = Math.floor(Math.random() * 90000) + 10000; // random 5-digit number
  return `REC-${datePart}-${randomPart}`;
}


document.getElementById('newReceiptBtn').addEventListener('click', () => {
  currentReceiptId = '';
  currentIndex = -1;
  cart = {};

  // Clear inputs
  customerNameInput.value = '';
  customerDestinationInput.value = '';
  receiptSearchInput.value = '';

  // Clear the cart visually
  if (typeof renderCart === 'function') {
    renderCart(); // re-render empty cart
  } else {
    cartTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">No items in cart.</td></tr>';
  }

  // Reset totals
  overallTotalSpan.textContent = '0';

  // Generate and display new receipt number
  const newReceiptNumber = generateReceiptNumber();
  document.getElementById('orderIdDisplay').textContent = `New Receipt: ${newReceiptNumber}`;
});



deleteBtn.addEventListener('click', () => {
  if (receiptList.length === 0 || currentIndex < 0 || currentIndex >= receiptList.length) {
    alert("No order to delete.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this order?");
  if (!confirmDelete) return;

  const receiptToDelete = receiptList[currentIndex];
  const receiptId = receiptToDelete.id; // like "-OSwVhpWn2jxjdQM8lRE"

  // Delete from Firebase database
  remove(ref(db, 'receipts/' + receiptId))
    .then(() => {
      // Remove from local list
      receiptList.splice(currentIndex, 1);

      // Adjust index after deletion
      if (currentIndex >= receiptList.length) {
        currentIndex = receiptList.length - 1;
      }

      if (currentIndex >= 0) {
        const currentReceipt = receiptList[currentIndex];
        populateReceipt(currentReceipt.data, currentReceipt.id);
      } else {
        clearReceiptInputs();
        currentIndex = -1;
      }

      updateNavButtons();
      alert("Order deleted successfully.");
    })
    .catch((error) => {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Try again.");
    });
});