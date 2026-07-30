import {
    db,
    collection,
    addDoc,
    getDocs,
    getDoc,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
    runTransaction
} from "./firebase.js";
// Smooth scroll for menu links
document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(e) {

        const target = this.getAttribute("href");

        if (target === "#") return;

        e.preventDefault();

        const element = document.querySelector(target);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});

// Navbar shadow on scroll
window.addEventListener("scroll", function() {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
  } else {
    navbar.style.boxShadow = "none";
  }
});

// Welcome message
console.log("Welcome to Radhe Radhe Bhog Heeng");
const topBtn = document.getElementById("topBtn");

if (topBtn) {
    topBtn.onclick = function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
}

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

if (menuToggle && menu) {
    menuToggle.addEventListener("click", function () {
        menu.classList.toggle("active");
    });
}

const fadeElements = document.querySelectorAll(
".card,.feature-card,.review-card,.gallery-grid img,.counter-box"
);

const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("show");
}
});
});

fadeElements.forEach(el=>{
el.classList.add("fade-up");
observer.observe(el);
});

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = 0;

function addToCart(
    button,
    product,
    price,
    collectionName,
    productId
) {

    let qty = parseInt(
        button.parentElement.querySelector(".qty").innerText
    );

    let existingItem = cart.find(
        item => item.productId === productId
    );

    if (existingItem) {

        existingItem.qty += qty;

    } else {

        cart.push({
            product: product,
            price: price,
            qty: qty,
            collectionName: collectionName,
            productId: productId
        });

    }

    document.getElementById("cartCount").innerText =
        cart.length;

    alert(
        product +
        " x " +
        qty +
        " added to cart!"
    );

    updateCartPopup();

    saveCart();

}

function increaseQty(btn){
let qty = btn.parentElement.querySelector(".qty");
qty.innerText = parseInt(qty.innerText) + 1;
}

function decreaseQty(btn){
let qty = btn.parentElement.querySelector(".qty");

if(parseInt(qty.innerText) > 1){
qty.innerText = parseInt(qty.innerText) - 1;
}
}
async function reduceProductStock() {
console.log("CART BEFORE STOCK UPDATE:", cart);
    try {

        for (const item of cart) {

            if (!item.collectionName || !item.productId) {
                console.warn(
                    "Product ID or Collection Name missing:",
                    item
                );
                continue;
            }

            const productRef = doc(
                db,
                item.collectionName,
                item.productId
            );

            await runTransaction(db, async (transaction) => {

                const productSnapshot =
                    await transaction.get(productRef);

                if (!productSnapshot.exists()) {
                    throw new Error(
                        "Product not found: " + item.product
                    );
                }

                const productData =
                    productSnapshot.data();

                const currentStock =
                    Number(productData.stock || 0);

                if (currentStock < item.qty) {
                    throw new Error(
                        item.product +
                        " has insufficient stock."
                    );
                }

                const newStock =
                    currentStock - item.qty;

                transaction.update(
                    productRef,
                    {
                        stock: newStock
                    }
                );

            });

        }

        console.log(
            "✅ Product stock updated successfully!"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Stock Update Error:",
            error
        );

        alert(
            "Unable to update product stock.\n\n" +
            error.message
        );

        return false;

    }

}
async function startRazorpayPayment(amount, orderData) {

    try {

        // Step 1: Create Razorpay Order
        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: amount
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert("Unable to create payment order.");
            return;
        }

        // Step 2: Razorpay Checkout Options
        const options = {

            key: "rzp_live_TJdYPzdq7h3o5A",

            amount: data.order.amount,

            currency: "INR",

            name: "Radhe Radhe Bhog Heeng",

            description: "Order Payment",

            order_id: data.order.id,

            handler: async function (paymentResponse) {

                console.log(
                    "Payment Successful:",
                    paymentResponse
                );

                try {

                    // Payment successful hone ke baad stock reduce hoga
                    const stockUpdated =
                        await reduceProductStock();

                    if (!stockUpdated) {

                        alert(
                            "Payment successful, but stock update failed. Please contact us."
                        );

                        return;
                    }

                    console.log(
                        "✅ Payment successful and stock updated."
                    );


                    // ==============================
                    // SAVE ORDER IN FIREBASE
                    // ==============================

                    await addDoc(
                        collection(db, "orders"),
                        {

                            orderId: orderData.orderId,

                            customer: orderData.customer,

                            phone: orderData.phone,

                            address: orderData.address,

                            total: orderData.total,

                            payment: "Razorpay",

                            items: orderData.items,

                            date: new Date().toLocaleString(),

                            orderDate:
                                new Date()
                                .toISOString()
                                .split("T")[0],

                            status: "Pending",

                            razorpayPaymentId:
                                paymentResponse
                                .razorpay_payment_id,

                            razorpayOrderId:
                                paymentResponse
                                .razorpay_order_id

                        }
                    );


                    console.log(
                        "✅ Order Saved in Firebase"
                    );


                    // ==============================
                    // OPEN WHATSAPP
                    // ==============================

                    window.open(
                        "https://wa.me/917733816532?text=" +
                        orderData.message,
                        "_blank"
                    );


                    // ==============================
                    // SUCCESS MODAL
                    // ==============================

                    document
                        .getElementById("successModal")
                        .style.display = "block";


                    alert(
                        "✅ Payment Successful!\n\n" +
                        "Your order has been placed successfully."
                    );


                } catch (error) {

                    console.error(
                        "Order Save Error:",
                        error
                    );

                    alert(
                        "Payment successful, but order saving failed. Please contact us."
                    );

                }

            },

            prefill: {

                name:
                    document
                    .getElementById("customerName")
                    ?.value || "",

                contact:
                    document
                    .getElementById("customerPhone")
                    ?.value || ""

            },

            theme: {

                color: "#6b0000"

            }

        };


        // Step 3: Open Razorpay Checkout

        const razorpay =
            new Razorpay(options);

        razorpay.open();


    } catch (error) {

        console.error(
            "Razorpay Error:",
            error
        );

        alert(
            "Unable to start payment.\n\n" +
            error.message
        );

    }

}async function showCart(){

if(cart.length===0){
alert("Your cart is empty!");
return;
}

let message="🛒 *My Order*%0A%0A";
let name = document.getElementById("customerName").value;
let phone = document.getElementById("customerPhone").value;
let address = document.getElementById("customerAddress").value;
localStorage.setItem("customerName", name);
localStorage.setItem("customerPhone", phone);
localStorage.setItem("customerAddress", address);
let paymentMethod = document.getElementById("paymentMethod").value;
let transactionId = document.getElementById("transactionId").value;

if(paymentMethod==="UPI" && transactionId.trim()===""){
alert("Please enter your UPI Transaction ID.");
return;
}
if(name.trim()===""){
alert("Please enter your name.");
return;
}

if(phone.trim()===""){
alert("Please enter your mobile number.");
return;
}

if(phone.length<10){
alert("Please enter a valid 10-digit mobile number.");
return;
}
message += "👤 Name: " + name + "%0A";
message += "📱 Mobile: " + phone + "%0A";
message += "📍 Address: " + address + "%0A%0A";
message += "💳 Payment: " + paymentMethod + "%0A%0A";
if(paymentMethod==="UPI"){
message += "💸 Transaction ID: " + transactionId + "%0A%0A";
}
let orderId = "RRBH-" + Date.now();

message += "🧾 Order ID: " + orderId + "%0A%0A";
let total=0;

cart.forEach((item,index)=>{

let itemTotal=item.price*item.qty;

message += (index+1)+". "
+item.product
+" × "
+item.qty
+" = ₹"
+itemTotal
+"%0A";

total += itemTotal;

});

let finalTotal = total;

if(discount===50){
finalTotal = total - 50;
}

if(discount===10){
finalTotal = total - (total * 0.10);
}

if(finalTotal<0){
finalTotal=0;
}

message += "%0A🎟️ Discount Applied = ₹" + (total-finalTotal) + "%0A";

let delivery = 0;

if(finalTotal < 500){
delivery = 50;
}

message += "🚚 Delivery Charge = ₹" + delivery + "%0A";

message += "💰 *Grand Total = ₹" + Math.round(finalTotal + delivery) + "*";
console.log("Final Payment Amount:", Math.round(finalTotal + delivery));
/*
const stockUpdated = await reduceProductStock();

if (!stockUpdated) {
    return;
}
*/
const paymentAmount = Math.round(finalTotal + delivery);

const orderData = {
    orderId: orderId,
    customer: name,
    phone: phone,
    address: address,
    total: paymentAmount,
    items: cart,
    message: message
};

startRazorpayPayment(
    paymentAmount,
    orderData
);

}
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartIcon = document.querySelector(".cart-icon");

if (cartIcon) {
    cartIcon.addEventListener("click", function () {
        cartModal.style.display = "block";
    });
}

if (closeCart) {
    closeCart.addEventListener("click", function () {
        cartModal.style.display = "none";
    });
}

window.addEventListener("click", function (e) {
    if (e.target === cartModal) {
        cartModal.style.display = "none";
    }
});

function updateCartPopup(){

const cartItems=document.getElementById("cartItems");
const cartTotal=document.getElementById("cartTotal");

cartItems.innerHTML="";

let total=0;

cart.forEach((item,index)=>{

let itemTotal=item.price*item.qty;
total+=itemTotal;

cartItems.innerHTML+=`
<div class="cart-item">
<div>
<h4>${item.product}</h4>
<p>${item.qty} × ₹${item.price}</p>
</div>
<div>
₹${itemTotal}
<button onclick="removeItem(${index})">🗑️</button>
</div>
</div>
`;

});

let finalTotal = total;

if(discount===50){
finalTotal = total - 50;
}

if(discount===10){
finalTotal = total - (total * 0.10);
}

if(finalTotal<0){
finalTotal=0;
}

cartTotal.innerText = Math.round(finalTotal);
let delivery = 0;

if(finalTotal < 500){
delivery = 50;
document.getElementById("deliveryCharge").innerText =
"🚚 Delivery Charge: ₹50";
}else{
document.getElementById("deliveryCharge").innerText =
"🚚 Delivery Charge: FREE";
}

cartTotal.innerText = Math.round(finalTotal + delivery);

}
const checkoutBtn = document.getElementById("checkoutBtn");

if (checkoutBtn) {
    checkoutBtn.onclick = function () {
        showCart();
    };
}

function removeItem(index){

cart.splice(index,1);

document.getElementById("cartCount").innerText=cart.length;

updateCartPopup();
saveCart();

}

function saveCart(){
localStorage.setItem("cart", JSON.stringify(cart));
}

updateCartPopup();

document.getElementById("cartCount").innerText = cart.length;
// Auto Fill Customer Details
window.addEventListener("load", function(){

    let savedName = localStorage.getItem("customerName");
    let savedPhone = localStorage.getItem("customerPhone");

    if(savedName){
        document.getElementById("customerName").value = savedName;
    }

    if(savedPhone){
        document.getElementById("customerPhone").value = savedPhone;
    }
let savedAddress = localStorage.getItem("customerAddress");

if(savedAddress){
    document.getElementById("customerAddress").value = savedAddress;
}
});
const sliderImages = [
"images/IMG-20260710-WA0004.jpg",
"images/IMG-20260710-WA0004.jpg",
"images/IMG-20260710-WA0004.jpg"
];

let currentSlide = 0;

setInterval(function(){

currentSlide++;

if(currentSlide >= sliderImages.length){
currentSlide = 0;
}

document.getElementById("sliderImage").src =
sliderImages[currentSlide];

},3000);

function nextSlide(){

currentSlide++;

if(currentSlide>=sliderImages.length){
currentSlide=0;
}

document.getElementById("sliderImage").src=sliderImages[currentSlide];

}

function prevSlide(){

currentSlide--;

if(currentSlide<0){
currentSlide=sliderImages.length-1;
}

document.getElementById("sliderImage").src=sliderImages[currentSlide];

}

function searchProducts(){

let input = document.getElementById("searchProduct").value.toLowerCase();

let cards = document.querySelectorAll(".product-grid .card");

cards.forEach(function(card){

let productName = card.querySelector("h3").innerText.toLowerCase();

if(productName.includes(input)){
card.style.display = "block";
}else{
card.style.display = "none";
}

});

}

const paymentSelect = document.getElementById("paymentMethod");
const upiBox = document.getElementById("upiBox");

if (paymentSelect && upiBox) {

    paymentSelect.addEventListener("change", function () {

        if (paymentSelect.value === "UPI") {
            upiBox.style.display = "block";
        } else {
            upiBox.style.display = "none";
        }

    });

}
function buyNow(
    btn,
    product,
    price,
    collectionName,
    productId
){

let qty = parseInt(
btn.parentElement.querySelector(".qty").innerText
);

cart = [];

cart.push({
    product: product,
    price: price,
    qty: qty,
    collectionName: collectionName,
    productId: productId
});

document.getElementById("cartCount").innerText = 1;

updateCartPopup();

document.getElementById("cartModal").style.display = "block";

}

document.getElementById("applyCouponBtn").onclick = function(){

let code = document.getElementById("couponCode").value.toUpperCase();

if(code==="SAVE50"){
discount=50;
alert("₹50 Discount Applied!");
}
else if(code==="WELCOME10"){
discount=10;
alert("10% Discount Applied!");
}
else{
discount=0;
alert("Invalid Coupon Code");
}

updateCartPopup();

};
function toggleWishlist(el){

if(el.innerText==="🤍"){
el.innerText="❤️";
localStorage.setItem(el.parentElement.querySelector("h3").innerText,"❤️");
}
else{
el.innerText="🤍";
localStorage.removeItem(el.parentElement.querySelector("h3").innerText);
}

}
document.querySelectorAll(".card").forEach(card => {

let name = card.querySelector("h3").innerText;

let heart = card.querySelector(".wishlist");

if(heart && localStorage.getItem(name)){
heart.innerText="❤️";
}

});
const recentOrders = [
"🛒 Ravi from Kota purchased Premium Heeng 50g • 2 min ago",
"🛒 Mohit from Kota purchased Premium Heeng 10g • 5 min ago",
"🛒 Priya from Kota purchased Kachori Special 10g • 8 min ago",
"🛒 Aman from Kota purchased Premium Heeng 5g • 12 min ago",
"🛒 Neha from Kota purchased Premium Heeng 50g • 15 min ago"
];

window.addEventListener("load", function () {

const popup = document.getElementById("orderPopup");
const popupText = document.getElementById("popupText");

if (!popup || !popupText) return;

function showOrderPopup() {

const random = recentOrders[Math.floor(Math.random() * recentOrders.length)];

popupText.innerText = random;
popup.style.display = "block";

setTimeout(function () {
popup.style.display = "none";
}, 4000);

}

setTimeout(showOrderPopup, 3000);
setInterval(showOrderPopup, 10000);

});

async function loadProfileStats() {

    const phone = localStorage.getItem("customerPhone");

    if (!phone) {
        return;
    }

    try {

        const q = query(
            collection(db, "orders"),
            where("phone", "==", phone)
        );

        const querySnapshot = await getDocs(q);

        let totalOrders = 0;
        let totalSpent = 0;

        querySnapshot.forEach((document) => {

            const order = document.data();

            totalOrders++;

            totalSpent += Number(
                order.total || 0
            );

        });

        document.getElementById(
            "profileOrderCount"
        ).innerText = totalOrders;

        document.getElementById(
            "profileTotalSpent"
        ).innerText = "₹" + totalSpent;

    } catch (error) {

        console.error(
            "Profile Stats Error:",
            error
        );

    }

}
function closeProfile() {

    document.getElementById("profileModal").style.display =
        "none";

}
function openLogin(){
    document.getElementById("loginModal").style.display = "block";
}
window.openLogin = openLogin;
const closeLoginBtn = document.getElementById("closeLogin");

if (closeLoginBtn) {
    closeLoginBtn.onclick = function () {
        document.getElementById("loginModal").style.display = "none";
    };
}

const loginModal = document.getElementById("loginModal");

if (loginModal) {
    loginModal.style.display = "none";
}

// ===============================
// SIMPLE FREE LOGIN
// ===============================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.onclick = function () {

    let name = document.getElementById("loginName").value.trim();
    let phone = document.getElementById("loginPhone").value.trim();

    if (name === "" || phone === "") {
        alert("Please enter your Name and Mobile Number.");
        return;
    }

    if (phone.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    // Save customer details
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerPhone", "+91" + phone);

    alert("✅ Login Successful!");

    // Close login modal
    document.getElementById("loginModal").style.display = "none";

    // Reload website
    location.reload();
};
}   
window.addEventListener("load", function(){

    let name = localStorage.getItem("customerName");

    if(name){

        document.getElementById("loginMenu").innerHTML = `
            <a href="#" onclick="openProfile(); return false;">
                👋 ${name}
            </a>

            <a href="#" onclick="showOrders(); return false;">
                📦 My Orders
            </a>

            <a href="#" onclick="logout(); return false;">
                🚪 Logout
            </a>
        `;

    }

});
function logout(){

    localStorage.removeItem("customerName");
    localStorage.removeItem("customerPhone");

    alert("Logged Out Successfully");

    location.reload();

}
// ===============================
// CUSTOMER PROFILE
// ===============================

async function openProfile() {

    const name = localStorage.getItem("customerName");
    const phone = localStorage.getItem("customerPhone");

    if (!name || !phone) {
        alert("Please Login First");
        return;
    }

    // Show customer details
    document.getElementById("profileName").innerText = name;
    document.getElementById("profilePhone").innerText = phone;

    // Get customer orders from Firebase
    try {

        const q = query(
            collection(db, "orders"),
            where("phone", "==", phone)
        );

        const snapshot = await getDocs(q);

        let totalSpent = 0;

        snapshot.forEach((orderDoc) => {

            const order = orderDoc.data();

            totalSpent += Number(order.total || 0);

        });

        document.getElementById("profileOrderCount").innerText =
            snapshot.size;

        document.getElementById("profileTotalSpent").innerText =
            "₹" + totalSpent;

    } catch (error) {

        console.error("Profile Error:", error);

        document.getElementById("profileOrderCount").innerText = "0";

        document.getElementById("profileTotalSpent").innerText = "₹0";

    }

    // Open Profile Modal
    document.getElementById("profileModal").style.display = "block";
}

async function showOrders() {

    let phone = localStorage.getItem("customerPhone");

    if (!phone) {
        alert("Please Login First");
        return;
    }

    const q = query(
        collection(db, "orders"),
        where("phone", "==", phone)
    );

    const querySnapshot = await getDocs(q);

    let html = "";

    if (querySnapshot.empty) {

        html = "<h3>No Orders Found</h3>";

    } else {

        querySnapshot.forEach((document) => {

    const order = document.data();

    let itemsHTML = "";

    if (order.items && order.items.length > 0) {

        order.items.forEach((item) => {

            itemsHTML += `
                <p>
                    • ${item.product} × ${item.qty}
                    — ₹${item.price * item.qty}
                </p>
            `;

        });

    } else {

        itemsHTML = `
            <p style="color:#777;">
                Product details not available
            </p>
        `;

    }

    html += `
    <div class="cart-item" style="display:block;">

        <h4>📦 ${order.orderId}</h4>

        <p>📅 ${order.date}</p>

       <p>
    <b>Status:</b>
    <span class="order-status ${(
        order.status || "Pending"
    ).toLowerCase()}">
        ${order.status || "Pending"}
    </span>
</p>

        <hr style="margin:10px 0;">

        <h4>🛍️ Products</h4>

        ${itemsHTML}

        <hr style="margin:10px 0;">

        <p>
            💳 Payment: ${order.payment || "Not Available"}
        </p>

        <p>
            📍 ${order.address || "Not Available"}
        </p>

        <h3 style="color:#6b0000;">
            💰 Total: ₹${order.total}
        </h3>
<button
    class="btn"
    onclick="viewOrderDetails('${document.id}')">
    👁️ View Details
</button>
    </div>
    `;

});

    }

    document.getElementById("ordersList").innerHTML = html;
    document.getElementById("ordersModal").style.display = "block";
}
function closeOrders(){

    document.getElementById("ordersModal").style.display = "none";

}

function closeSuccess(){
    document.getElementById("successModal").style.display = "none";
}
const invoiceBtn = document.getElementById("invoiceBtn");

if (invoiceBtn) {
    invoiceBtn.onclick = function () {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let name = document.getElementById("customerName").value;
    let phone = document.getElementById("customerPhone").value;
    let address = document.getElementById("customerAddress").value;

    let y = 20;

    doc.setFontSize(18);
    doc.text("Radhe Radhe Bhog Heeng", 20, y);

    y += 10;
    doc.setFontSize(12);
    doc.text("Invoice", 20, y);

    y += 10;
    doc.text("Customer: " + name, 20, y);

    y += 8;
    doc.text("Mobile: " + phone, 20, y);

    y += 8;
    doc.text("Address: " + address, 20, y);

    y += 12;
    doc.text("------------------------------", 20, y);

    let total = 0;

    cart.forEach(function(item){
        y += 8;
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        doc.text(item.product + " x " + item.qty + " = Rs " + itemTotal, 20, y);
    });

    y += 12;
    doc.text("------------------------------", 20, y);

    y += 10;
    doc.setFontSize(14);
    doc.text("Total = Rs " + total, 20, y);

    y += 10;
    doc.setFontSize(10);
    doc.text("Thank you for shopping!", 20, y);

    doc.save("Invoice.pdf");
doc.save("Invoice.pdf");

    };   // function close

}       // ✅ if close

async function openAdmin(){

    let pass = prompt("Enter Admin Password");

    if(pass !== "Radhe2026"){
        alert("Wrong Password");
        return;
    }

    const querySnapshot = await getDocs(collection(db, "orders"));

    let totalSales = 0;
    let html = "";
  
    let todayOrders = 0;
    let todaySales = 0;
    querySnapshot.forEach((document) => {

    const order = document.data();

    totalSales += Number(order.total || 0);
let today = new Date().toISOString().split("T")[0];

if (order.orderDate === today) {
    todayOrders++;
    todaySales += Number(order.total || 0);
}   html += `
<div class="cart-item">
    <div>
        <h4>${order.orderId}</h4>
        <p>👤 ${order.customer}</p>
        <p>📞 ${order.phone}</p>
        <p>📅 ${order.date}</p>
        <p>📍 ${order.address}</p>
        <p>💳 ${order.payment}</p>
        <button
    class="btn"
    onclick="notifyCustomerWhatsApp(
        '${order.phone}',
        '${order.orderId}',
        '${order.status || "Pending"}'
    )">
    📱 Notify Customer
</button>
    </div>

    <div>
        <h4>₹${order.total}</h4>

        <select onchange="updateOrderStatus('${document.id}', this.value)">
            <option ${order.status=="Pending"?"selected":""}>Pending</option>
            <option ${order.status=="Packed"?"selected":""}>Packed</option>
            <option ${order.status=="Shipped"?"selected":""}>Shipped</option>
            <option ${order.status=="Delivered"?"selected":""}>Delivered</option>
            <option ${order.status=="Cancelled"?"selected":""}>Cancelled</option>
        </select>

        <br><br>

        <button class="btn"
            onclick="deleteOrder('${document.id}')">
            🗑️ Delete
        </button>
    </div>
</div>
`;
});

    document.getElementById("totalOrders").innerText = querySnapshot.size;
    document.getElementById("totalOrdersCard").innerText = querySnapshot.size;
    document.getElementById("totalSales").innerText = totalSales;
    document.getElementById("totalSalesCard").innerText = "₹" + totalSales;
document.getElementById("todayOrders").innerText = todayOrders;
document.getElementById("todaySales").innerText = "₹" + todaySales;
    document.getElementById("adminOrders").innerHTML = html;

    document.getElementById("adminModal").style.display = "block";
}
function liveOrders() {

    let firstLoad = true;

    onSnapshot(collection(db, "orders"), () => {

        if (firstLoad) {
            firstLoad = false;
            return;
        }

        const popup = document.getElementById("newOrderPopup");

        if (popup) {
            popup.innerHTML = "🔔 New Order Received!";
            popup.style.display = "block";
            popup.style.opacity = "1";

            setTimeout(function () {
                popup.style.display = "none";
            }, 4000);
        }

        setTimeout(function () {
            if (document.getElementById("adminModal").style.display === "block") {
                openAdmin();
            }
        }, 500);

    });

}
function closeAdmin(){
    document.getElementById("adminModal").style.display = "none";
}
function searchAdminOrders(){

    let input = document.getElementById("adminSearch").value.toLowerCase();

    let items = document.querySelectorAll("#adminOrders .cart-item");

    items.forEach(function(item){

        if(item.innerText.toLowerCase().includes(input)){
            item.style.display = "flex";
        }else{
            item.style.display = "none";
        }

    });

}
async function exportOrders() {

    const querySnapshot = await getDocs(collection(db, "orders"));

    let data = [];

    querySnapshot.forEach((document) => {

        const order = document.data();

        data.push({
            "Order ID": order.orderId,
            "Customer": order.customer,
            "Phone": order.phone,
            "Address": order.address,
            "Payment": order.payment,
            "Status": order.status,
            "Total": order.total,
            "Date": order.date
        });

    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, "Radhe_Radhe_Bhog_Orders.xlsx");

}

async function deleteOrder(docId) {

    if (!confirm("Delete this order?")) {
        return;
    }

    try {

        await deleteDoc(doc(db, "orders", docId));

        alert("Order Deleted Successfully!");

        openAdmin();

    } catch (error) {

        console.error(error);
        alert("Unable to delete order.");

    }

}
async function updateOrderStatus(docId, status) {

    try {

        await updateDoc(doc(db, "orders", docId), {
    status: status
});

if (confirm("✅ Order Status Updated!\n\nNotify Customer on WhatsApp?")) {

    const orderSnap = await getDocs(
        query(collection(db, "orders"))
    );

    orderSnap.forEach((d) => {

        if (d.id === docId) {

            const order = d.data();

            notifyCustomerWhatsApp(
                order.phone,
                order.orderId,
                status
            );

        }

    });

}

        alert("Order Status Updated!");

    } catch (error) {

        console.error(error);
        alert("Unable to update status.");

    }

}
window.addToCart = addToCart;
window.buyNow = buyNow;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.removeItem = removeItem;
window.toggleWishlist = toggleWishlist;
window.openLogin = openLogin;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.logout = logout;
window.showOrders = showOrders;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.closeOrders = closeOrders;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetails = closeOrderDetails;
window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.exportOrders = exportOrders;
window.deleteOrder = deleteOrder;
window.updateOrderStatus = updateOrderStatus;
window.notifyCustomerWhatsApp = notifyCustomerWhatsApp;
window.saveProfileAddress = saveProfileAddress;
window.closeSuccess = closeSuccess;
window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.searchProducts = searchProducts;
// ==========================================
// LOAD ALL PRODUCTS FROM FIREBASE
// ==========================================

async function loadProducts() {

    const productGrid = document.getElementById("productGrid");

    if (!productGrid) return;

    productGrid.innerHTML = "";

    const collections = [
        "products_1",
        "products_2",
        "products_3",
        "products_5"
    ];

    let totalProducts = 0;

    try {

        for (const collectionName of collections) {

            console.log(
                "Loading collection:",
                collectionName
            );

            const snapshot = await getDocs(
                collection(db, collectionName)
            );

            console.log(
                collectionName,
                "Documents:",
                snapshot.size
            );

            snapshot.forEach((productDoc) => {

                const product = productDoc.data();

                console.log(
                    "Product Found:",
                    collectionName,
                    productDoc.id,
                    product
                );

                // Only active products
                if (product.active === false) {
                    return;
                }

                // =========================
                // PRODUCT BASIC DETAILS
                // =========================

                const name =
                    product.name || "Product";

                const price =
                    Number(product.price || 0);

                const stock =
                    Number(product.stock || 0);

                const description =
                    product.description || "";

                const image =
                    product.image ||
                    "images/IMG-20260710-WA0004.jpg";

                const category =
                    product.category || "Other";

                totalProducts++;


                // =========================
                // STOCK STATUS
                // =========================

                let stockHTML = "";

                if (stock <= 0) {

                    stockHTML = `
                        <p class="stock out-of-stock">
                            🔴 Out of Stock
                        </p>
                    `;

                } else if (stock <= 10) {

                    stockHTML = `
                        <p class="stock low-stock">
                            🟡 Only ${stock} left
                        </p>
                    `;

                } else {

                    stockHTML = `
                        <p class="stock in-stock">
                            🟢 In Stock
                        </p>
                    `;

                }


                // =========================
                // SAFE PRODUCT NAME
                // =========================

                const safeName =
                    name.replace(/'/g, "\\'");


                // =========================
                // PRODUCT CARD
                // =========================

                productGrid.innerHTML += `

                    <div class="card">

                        <img
                            src="${image}"
                            alt="${name}"
                            onerror="this.src='images/IMG-20260710-WA0004.jpg'"
                        >

                        <span
                            class="wishlist"
                            onclick="toggleWishlist(this)">
                            🤍
                        </span>

                        <h3>
                            ${name}
                        </h3>

                        <p>
                            ${description}
                        </p>

                        <p class="product-category">
                            📂 Category: ${category}
                        </p>

                        <h3>
                            ₹${price}
                        </h3>

                        ${stockHTML}


                        <!-- QUANTITY -->

                        <div class="quantity-box">

                            <button
                                onclick="decreaseQty(this)">
                                −
                            </button>

                            <span class="qty">
                                1
                            </span>

                            <button
                                onclick="increaseQty(this)">
                                +
                            </button>

                        </div>


                        <!-- ADD TO CART -->

                        ${
                            stock > 0
                                ? `
                                    <button
                                        class="cart-btn"
                                      onclick="addToCart(
    this,
    '${safeName}',
    ${price},
    '${collectionName}',
    '${productDoc.id}'
)">

                                        🛒 Add to Cart

                                    </button>
                                `
                                : `
                                    <button
                                        class="cart-btn"
                                        disabled
                                        style="
                                            background:#999;
                                            cursor:not-allowed;
                                            opacity:0.7;
                                        ">

                                        🔴 Out of Stock

                                    </button>
                                `
                        }


                        <!-- BUY NOW -->

                        ${
                            stock > 0
                                ? `
                                    <button
                                        class="buy-btn"
                                        onclick="buyNow(
    this,
    '${safeName}',
    ${price},
    '${collectionName}',
    '${productDoc.id}'
)">

                                        ⚡ Buy Now

                                    </button>
                                `
                                : `
                                    <button
                                        class="buy-btn"
                                        disabled
                                        style="
                                            background:#999;
                                            cursor:not-allowed;
                                            opacity:0.7;
                                        ">

                                        🔴 Out of Stock

                                    </button>
                                `
                        }


                        <!-- DELIVERY -->

                        <p class="delivery-tag">

                            🚚 Delivery Only in Kota

                        </p>

                    </div>

                `;

            });

        }


        // =========================
        // CART COUNT
        // =========================

        const cartCountElement =
            document.getElementById("cartCount");

        if (cartCountElement) {

            cartCountElement.innerText =
                cart.length;

        }


        // =========================
        // CONSOLE LOG
        // =========================

        console.log(
            "=============================="
        );

        console.log(
            "TOTAL PRODUCTS LOADED:",
            totalProducts
        );

        console.log(
            "=============================="
        );


    } catch (error) {

        console.error(
            "FIREBASE PRODUCT ERROR:",
            error
        );

        productGrid.innerHTML = `

            <p style="
                text-align:center;
                color:red;
                width:100%;
            ">

                Unable to load products.

            </p>

        `;

    }

}

// Load Products
loadProducts();

// Start Live Orders
liveOrders();async function viewOrderDetails(docId) {

    try {

        const orderDoc = await getDocs(
            query(
                collection(db, "orders"),
                where("__name__", "==", docId)
            )
        );

        if (orderDoc.empty) {
            alert("Order details not found.");
            return;
        }

        let order = orderDoc.docs[0].data();
// ===============================
// UPDATE ORDER TRACKING
// ===============================

const currentStatus = (
    order.status || "Pending"
).toLowerCase();

const trackingSteps = {
    pending: document.getElementById("trackingPending"),
    packed: document.getElementById("trackingPacked"),
    shipped: document.getElementById("trackingShipped"),
    delivered: document.getElementById("trackingDelivered")
};

// Remove active class first
Object.values(trackingSteps).forEach(step => {

    if (step) {
        step.classList.remove("active");
    }

});

// Activate steps according to order status

if (currentStatus === "pending") {

    trackingSteps.pending?.classList.add("active");

}

else if (currentStatus === "packed") {

    trackingSteps.pending?.classList.add("active");
    trackingSteps.packed?.classList.add("active");

}

else if (currentStatus === "shipped") {

    trackingSteps.pending?.classList.add("active");
    trackingSteps.packed?.classList.add("active");
    trackingSteps.shipped?.classList.add("active");

}

else if (currentStatus === "delivered") {

    trackingSteps.pending?.classList.add("active");
    trackingSteps.packed?.classList.add("active");
    trackingSteps.shipped?.classList.add("active");
    trackingSteps.delivered?.classList.add("active");

}
        let itemsHTML = "";

        if (order.items && order.items.length > 0) {

            order.items.forEach((item) => {

                itemsHTML += `
                    <div class="cart-item">

                        <div>
                            <h4>${item.product}</h4>
                            <p>Quantity: ${item.qty}</p>
                            <p>Price: ₹${item.price}</p>
                        </div>

                        <strong>
                            ₹${item.price * item.qty}
                        </strong>

                    </div>
                `;

            });

        } else {

            itemsHTML = `
                <p>
                    Product details are not available
                    for this order.
                </p>
            `;

        }

        document.getElementById("orderDetailsContent").innerHTML = `
    <div id="orderInfoContent">

            <h3>📦 ${order.orderId}</h3>

            <p>
                <b>📅 Date:</b>
                ${order.date || "Not Available"}
            </p>

            <p>
                <b>📊 Status:</b>
                ${order.status || "Pending"}
            </p>

            <hr>

            <h3>🛍️ Products</h3>

            ${itemsHTML}

            <hr>

            <p>
                <b>👤 Customer:</b>
                ${order.customer || "Not Available"}
            </p>

            <p>
                <b>📞 Mobile:</b>
                ${order.phone || "Not Available"}
            </p>

            <p>
                <b>📍 Address:</b>
                ${order.address || "Not Available"}
            </p>

            <p>
                <b>💳 Payment:</b>
                ${order.payment || "Not Available"}
            </p>

            <h2>
                💰 Grand Total: ₹${order.total}
            </h2>

        `;

        document.getElementById(
            "orderDetailsModal"
        ).style.display = "block";

    } catch (error) {

        console.error(
            "Order Details Error:",
            error
        );

        alert(
            "Unable to load order details."
        );

    }

}
function closeOrderDetails() {

    document.getElementById(
        "orderDetailsModal"
    ).style.display = "none";

}
function notifyCustomerWhatsApp(phone, orderId, status) {

    if (!phone) {
        alert("Customer phone number not available.");
        return;
    }

    // Remove + sign and spaces
    let cleanPhone = phone
        .replace("+", "")
        .replace(/\s/g, "");

    let message =
        "📦 *Radhe Radhe Bhog Heeng - Order Update*%0A%0A" +
        "🧾 Order ID: " + orderId + "%0A" +
        "📊 Status: *" + status + "*%0A%0A";

    if (status === "Pending") {

        message +=
            "🙏 Your order has been received successfully.%0A" +
            "We will process it shortly.";

    } else if (status === "Packed") {

        message +=
            "📦 Your order has been packed successfully.%0A" +
            "It will be shipped soon.";

    } else if (status === "Shipped") {

        message +=
            "🚚 Your order has been shipped.%0A" +
            "Your order is on the way.";

    } else if (status === "Delivered") {

        message +=
            "🎉 Your order has been delivered successfully.%0A" +
            "Thank you for shopping with Radhe Radhe Bhog Heeng! ❤️";

    } else if (status === "Cancelled") {

        message +=
            "❌ Your order has been cancelled.%0A" +
            "Please contact us if you have any questions.";

    }

    const whatsappURL =
        "https://wa.me/" +
        cleanPhone +
        "?text=" +
        message;

    window.open(
        whatsappURL,
        "_blank"
    );

}
function saveProfileAddress() {

    const address =
        document.getElementById("profileAddress").value.trim();

    if (address === "") {
        alert("Please enter your delivery address.");
        return;
    }

    localStorage.setItem(
        "customerAddress",
        address
    );

    // Checkout address field bhi update hoga
    const checkoutAddress =
        document.getElementById("customerAddress");

    if (checkoutAddress) {
        checkoutAddress.value = address;
    }

    alert("✅ Delivery Address Saved Successfully!");

}
// ===============================
// PRODUCT MANAGEMENT MODAL
// ===============================

function openProductManager() {

    document.getElementById("productManagerModal").style.display = "block";

    loadAdminProducts();

}

function closeProductManager() {

    document.getElementById("productManagerModal").style.display = "none";

}

// Make functions available to HTML buttons
window.openProductManager = openProductManager;
window.closeProductManager = closeProductManager;
// ===============================
// LOAD PRODUCTS IN ADMIN PANEL
// ===============================

async function loadAdminProducts() {

    const productList =
        document.getElementById("adminProductList");

    if (!productList) return;

    productList.innerHTML =
        "<p>Loading Products...</p>";

    const collections = [
        "products_1",
        "products_2",
        "products_3",
        "products_5"
    ];

    let html = "";

    try {

        for (const collectionName of collections) {

            const snapshot = await getDocs(
                collection(db, collectionName)
            );

            snapshot.forEach((productDoc) => {

                const product = productDoc.data();

                const name =
                    product.name || "Unnamed Product";

                const price =
                    Number(product.price || 0);

                const stock =
                    Number(product.stock || 0);

                const description =
                    product.description || "";

                const image =
                    product.image ||
                    "images/IMG-20260710-WA0004.jpg";

                const active =
                    product.active !== false;
const visibilityText = active
    ? "🟢 Product is Active"
    : "🔴 Product is Hidden";
                // ===============================
                html += `

                <div class="cart-item"
                    style="
                    display:flex;
                    flex-direction:column;
                    gap:10px;
                    margin-bottom:15px;
                    ">

                    <div>

                        <img
                            src="${image}"
                            style="
                            width:80px;
                            height:80px;
                            object-fit:cover;
                            border-radius:8px;
                            "
                        >

                    </div>

                    <h4>
                        ${name}
                    </h4>

                    <p>
                        💰 Price: ₹${price}
                    </p>

                   <div class="inventory-control">

    <p>
        📦 Stock:
        <strong>
            ${stock}
        </strong>
    </p>

    <button
        class="btn"
        onclick="
            changeProductStock(
                '${collectionName}',
                '${productDoc.id}',
                -1
            )
        "
        ${stock <= 0 ? "disabled" : ""}>

        ➖

    </button>

    <button
        class="btn"
        onclick="
            changeProductStock(
                '${collectionName}',
                '${productDoc.id}',
                1
            )
        ">

        ➕

    </button>

    <button
        class="btn"
        onclick="
            editProductStock(
                '${collectionName}',
                '${productDoc.id}',
                ${stock}
            )
        ">

        ✏️ Edit Stock

    </button>

</div>

                    <p>
                        📝 ${description}
                    </p>

                   <p>
    ${visibilityText}
</p>

<button
    class="btn"
    onclick="
        toggleProductVisibility(
            '${collectionName}',
            '${productDoc.id}',
            ${active}
        )
    ">

    ${active
        ? "🔴 Hide Product"
        : "🟢 Show Product"
    }

</button>

                    <p>
                        📁 Collection:
                        ${collectionName}
                    </p>

                    <button
                        class="btn"
                        onclick="
                        editProduct(
                            '${collectionName}',
                            '${productDoc.id}'
                        )">

                        ✏️ Edit Product

                    </button>

                    <button
                        class="btn"
                        onclick="
                        deleteProduct(
                            '${collectionName}',
                            '${productDoc.id}'
                        )">

                        🗑️ Delete Product

                    </button>

                </div>

                `;

            });

        }

        if (html === "") {

            html =
                "<p>No Products Found.</p>";

        }

        productList.innerHTML = html;

    } catch (error) {

        console.error(
            "Admin Product Loading Error:",
            error
        );

        productList.innerHTML =
            "<p style='color:red;'>Unable to load products.</p>";

    }

}
// ===============================
// CHANGE PRODUCT STOCK
// ===============================
async function changeProductStock(
    collectionName,
    productId,
    change
) {
    try {
        const productRef = doc(
            db,
            collectionName,
            productId
        );

        const productSnapshot =
            await getDoc(productRef);

        if (!productSnapshot.exists()) {
            alert("Product not found.");
            return;
        }

        const productData =
            productSnapshot.data();

        const currentStock =
            Number(productData.stock || 0);

        const newStock =
            currentStock + change;

        if (newStock < 0) {
            alert("Stock cannot be negative.");
            return;
        }

        await updateDoc(
            productRef,
            {
                stock: newStock
            }
        );

        console.log(
            "Stock Updated:",
            newStock
        );

        await loadAdminProducts();
        await loadProducts();

    } catch (error) {
        console.error(
            "Change Stock Error:",
            error
        );

        alert(
            "Unable to update stock.\n\n" +
            error.message
        );
    }
}

// Make function available to HTML
window.changeProductStock =
    changeProductStock;
// ===============================
// EDIT PRODUCT STOCK
// ===============================

async function editProductStock(
    collectionName,
    productId,
    currentStock
) {

    const newStock = prompt(
        "Enter New Stock Quantity:",
        currentStock
    );

    // Cancel button press kiya
    if (newStock === null) {
        return;
    }

    // Empty value check
    if (newStock.trim() === "") {
        alert("Please enter stock quantity.");
        return;
    }

    // Number check
    const stockNumber = Number(newStock);

    if (isNaN(stockNumber)) {
        alert("Please enter a valid number.");
        return;
    }

    // Negative stock allowed nahi hai
    if (stockNumber < 0) {
        alert("Stock cannot be negative.");
        return;
    }

    try {

        await updateDoc(
            doc(
                db,
                collectionName,
                productId
            ),
            {
                stock: stockNumber
            }
        );

        alert(
            "✅ Stock Updated Successfully!\n\n" +
            "New Stock: " +
            stockNumber
        );

        // Refresh Admin Product List
        await loadAdminProducts();

        // Refresh Website Product List
        await loadProducts();

    } catch (error) {

        console.error(
            "Edit Stock Error:",
            error
        );

        alert(
            "❌ Unable to update stock.\n\n" +
            error.message
        );

    }

}

// Make function available to HTML
window.editProductStock =
    editProductStock;
// ===============================
// TOGGLE PRODUCT VISIBILITY
// ===============================

async function toggleProductVisibility(
    collectionName,
    productId,
    currentStatus
) {

    try {

        const newStatus = !currentStatus;

        await updateDoc(
            doc(db, collectionName, productId),
            {
                active: newStatus
            }
        );

        alert(
            newStatus
                ? "🟢 Product is now Active!"
                : "🔴 Product has been Hidden!"
        );

        // Refresh Admin Product List
        await loadAdminProducts();

        // Refresh Website Product List
        await loadProducts();

    } catch (error) {

        console.error(
            "Product Visibility Error:",
            error
        );

        alert(
            "❌ Unable to change product visibility.\n\n" +
            error.message
        );

    }

}

window.toggleProductVisibility =
    toggleProductVisibility;


// ===============================
// ADMIN PRODUCT SEARCH & FILTER
// ===============================

function filterAdminProducts() {

    const searchInput =
        document.getElementById("adminProductSearch");

    const statusFilter =
        document.getElementById("adminProductStatusFilter");

    const searchText =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";

    const productCards =
        document.querySelectorAll(
            "#adminProductList .cart-item"
        );

    productCards.forEach(card => {

        const productText =
            card.innerText.toLowerCase();

        const isActive =
            productText.includes("🟢 product is active");

        const isHidden =
            productText.includes("🔴 product is hidden");

        const matchesSearch =
            productText.includes(searchText);

        let matchesStatus = true;

        if (selectedStatus === "active") {
            matchesStatus = isActive;
        }

        if (selectedStatus === "hidden") {
            matchesStatus = isHidden;
        }

        if (matchesSearch && matchesStatus) {

            card.style.display = "flex";

        } else {

            card.style.display = "none";

        }

    });

}

window.filterAdminProducts =
    filterAdminProducts;
// ===============================
// ADD NEW PRODUCT
// ===============================

async function addNewProduct() {

    const name =
        document.getElementById("adminProductName").value.trim();

    const price =
        Number(document.getElementById("adminProductPrice").value);

    const stock =
        Number(document.getElementById("adminProductStock").value);

    const image =
        document.getElementById("adminProductImage").value.trim();

    const description =
        document.getElementById("adminProductDescription").value.trim();

    const collectionName =
        document.getElementById("adminProductCollection").value;
const category =
    document.getElementById("adminProductCategory").value;
    // Validation
    if (name === "") {
        alert("Please enter Product Name.");
        return;
    }

    if (price <= 0) {
        alert("Please enter a valid Product Price.");
        return;
    }

    if (stock < 0) {
        alert("Stock cannot be negative.");
        return;
    }

    try {

        await addDoc(
            collection(db, collectionName),
            {
                name: name,
                price: price,
                stock: stock,
                image: image,
                description: description,
                category: category,
                active: true,
                createdAt: new Date().toISOString()
            }
        );

        alert("✅ Product Added Successfully!");

        // Clear form
        document.getElementById("adminProductName").value = "";
        document.getElementById("adminProductPrice").value = "";
        document.getElementById("adminProductStock").value = "";
        document.getElementById("adminProductImage").value = "";
        document.getElementById("adminProductDescription").value = "";

        // Reload product list
        loadAdminProducts();

        // Reload website products
        loadProducts();

    } catch (error) {

        console.error(
            "Add Product Error:",
            error
        );

        alert(
            "❌ Unable to Add Product.\n\n" +
            error.message
        );

    }

}

// Make function available to HTML
window.addNewProduct = addNewProduct;
// ===============================
// EDIT PRODUCT
// ===============================

async function editProduct(collectionName, productId) {

    try {

        // Get current product
        const snapshot = await getDocs(
            collection(db, collectionName)
        );

        let productData = null;

        snapshot.forEach((productDoc) => {

            if (productDoc.id === productId) {
                productData = productDoc.data();
            }

        });

        if (!productData) {
            alert("Product not found.");
            return;
        }

        // Ask new values
        const newName = prompt(
            "Enter Product Name:",
            productData.name || ""
        );

        if (newName === null) return;

        const newPrice = prompt(
            "Enter Product Price:",
            productData.price || 0
        );

        if (newPrice === null) return;

        const newStock = prompt(
            "Enter Stock Quantity:",
            productData.stock || 0
        );

        if (newStock === null) return;

        const newDescription = prompt(
            "Enter Product Description:",
            productData.description || ""
        );

        if (newDescription === null) return;

        const newImage = prompt(
            "Enter Product Image URL:",
            productData.image || ""
        );

        if (newImage === null) return;

        // Update Firebase
        await updateDoc(
            doc(db, collectionName, productId),
            {
                name: newName.trim(),
                price: Number(newPrice),
                stock: Number(newStock),
                description: newDescription.trim(),
                image: newImage.trim()
            }
        );

        alert("✅ Product Updated Successfully!");

        // Refresh Admin Product List
        loadAdminProducts();

        // Refresh Website Product List
        loadProducts();

    } catch (error) {

        console.error(
            "Edit Product Error:",
            error
        );

        alert(
            "❌ Unable to Update Product.\n\n" +
            error.message
        );

    }

}

// Make function available to HTML
window.editProduct = editProduct;
// ===============================
// DELETE PRODUCT
// ===============================

async function deleteProduct(collectionName, productId) {

    const confirmDelete = confirm(
        "⚠️ Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, collectionName, productId)
        );

        alert("✅ Product Deleted Successfully!");

        // Refresh Admin Product List
        loadAdminProducts();

        // Refresh Website Product List
        loadProducts();

    } catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );

        alert(
            "❌ Unable to Delete Product.\n\n" +
            error.message
        );

    }

}

// Make function available to HTML
window.deleteProduct = deleteProduct;
// ===============================
// WEBSITE PRODUCT CATEGORY FILTER
// ===============================

function filterProductsByCategory(category) {

    const productCards =
        document.querySelectorAll(
            "#productGrid .card"
        );

    productCards.forEach(card => {

        const categoryText =
            card.querySelector(".product-category");

        // Agar product mein category available nahi hai
        if (!categoryText) {

            if (category === "all") {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }

            return;
        }

        const productCategory =
            categoryText.innerText
                .replace("📂 Category:", "")
                .trim();

        if (
            category === "all" ||
            productCategory.toLowerCase() ===
            category.toLowerCase()
        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

    // Active button change
    document
        .querySelectorAll(".category-btn")
        .forEach(button => {

            button.classList.remove("active");

        });

    // Clicked button ko active banana
    event.currentTarget.classList.add("active");

}


// HTML onclick ke liye function available
window.filterProductsByCategory =
    filterProductsByCategory;
