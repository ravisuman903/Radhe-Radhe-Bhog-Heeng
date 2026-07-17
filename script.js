import {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "./firebase.js";
// Smooth scroll for menu links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
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

function addToCart(button, product, price){

let qty = parseInt(
button.parentElement.querySelector(".qty").innerText
);

let existingItem = cart.find(item => item.product === product);

if(existingItem){
existingItem.qty += qty;
}else{
cart.push({
product: product,
price: price,
qty: qty
});
}

document.getElementById("cartCount").innerText = cart.length;

alert(product + " x " + qty + " added to cart!");
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

function showCart(){

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
let orders = JSON.parse(localStorage.getItem("orders")) || [];

orders.push({
    id: orderId,
    total: Math.round(finalTotal + delivery),
    date: new Date().toLocaleString()
});

localStorage.setItem("orders", JSON.stringify(orders));
addDoc(collection(db, "orders"), {
    orderId: orderId,
    customer: name,
    phone: phone,
    address: address,
    total: Math.round(finalTotal + delivery),
    payment: paymentMethod,
    date: new Date().toLocaleString(),
    status: "Pending"
})
.then(() => {
    console.log("Order Saved");

    window.open(
        "https://wa.me/917733816532?text=" + message,
        "_blank"
    );

    document.getElementById("successModal").style.display = "block";
})
.catch((error) => {
    console.error(error);

    // Firebase fail ho tab bhi WhatsApp open hoga
    window.open(
        "https://wa.me/917733816532?text=" + message,
        "_blank"
    );
});
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
document.getElementById("checkoutBtn").onclick = function () {
    showCart();
};

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

paymentSelect.addEventListener("change", function(){

if(paymentSelect.value==="UPI"){
upiBox.style.display="block";
}else{
upiBox.style.display="none";
}

});
function buyNow(btn, product, price){

let qty = parseInt(
btn.parentElement.querySelector(".qty").innerText
);

cart = [];

cart.push({
product: product,
price: price,
qty: qty
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
function openLogin(){
    document.getElementById("loginModal").style.display = "block";
}

document.getElementById("closeLogin").onclick = function(){
    document.getElementById("loginModal").style.display = "none";
}

document.getElementById("loginBtn").onclick = function(){

    let name = document.getElementById("loginName").value;
    let phone = document.getElementById("loginPhone").value;

    if(name==="" || phone===""){
        alert("Please fill all details");
        return;
    }

    localStorage.setItem("customerName", name);
    localStorage.setItem("customerPhone", phone);

    alert("Login Successful!");

    document.getElementById("loginModal").style.display = "none";
}
window.addEventListener("load", function(){

    let name = localStorage.getItem("customerName");

    if(name){

document.getElementById("loginMenu").innerHTML = `
<a href="#">👋 ${name}</a>
<a href="#" onclick="logout(); return false;">🚪 Logout</a>
`;

    }

});
function logout(){

    localStorage.removeItem("customerName");
    localStorage.removeItem("customerPhone");

    alert("Logged Out Successfully");

    location.reload();

}
function showOrders(){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    let html = "";

    if(orders.length==0){
        html = "No Orders Yet";
    }else{

        orders.forEach(function(order){

            html += `
            <div class="cart-item">
                <div>
                    <h4>${order.id}</h4>
                    <p>${order.date}</p>
                </div>

 <div>
    ₹${order.total}
    <br><br>
    <button class="btn"
        onclick="deleteOrder('${order.id}')">
        🗑️ Delete
    </button>
</div>
            </div>
            `;

        });

    }

    document.getElementById("ordersList").innerHTML = html;

    document.getElementById("ordersModal").style.display="block";

}

function closeOrders(){

    document.getElementById("ordersModal").style.display = "none";

}

function closeSuccess(){
    document.getElementById("successModal").style.display = "none";
}
document.getElementById("invoiceBtn").onclick = function () {

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

};
async function openAdmin(){

    let pass = prompt("Enter Admin Password");

    if(pass !== "Radhe2026"){
        alert("Wrong Password");
        return;
    }

    const querySnapshot = await getDocs(collection(db, "orders"));

    let totalSales = 0;
    let html = "";

    querySnapshot.forEach((document) => {

    const order = document.data();

    totalSales += Number(order.total || 0);

   html += `
<div class="cart-item">
    <div>
        <h4>${order.orderId}</h4>
        <p>👤 ${order.customer}</p>
        <p>📞 ${order.phone}</p>
        <p>📅 ${order.date}</p>
        <p>📍 ${order.address}</p>
        <p>💳 ${order.payment}</p>
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

    document.getElementById("adminOrders").innerHTML = html;

    document.getElementById("adminModal").style.display = "block";
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
window.toggleWishlist = toggleWishlist;
window.openLogin = openLogin;
window.logout = logout;
window.showOrders = showOrders;
window.closeOrders = closeOrders;
window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.deleteOrder = deleteOrder;
window.updateOrderStatus = updateOrderStatus;
window.closeSuccess = closeSuccess;
window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.searchProducts = searchProducts;
