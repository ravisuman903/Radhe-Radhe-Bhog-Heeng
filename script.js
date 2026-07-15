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
const topBtn=document.getElementById("topBtn");

topBtn.onclick=function(){
window.scrollTo({
top:0,
behavior:"smooth"
});
};

const menuToggle=document.querySelector(".menu-toggle");
const menu=document.querySelector(".menu");

menuToggle.addEventListener("click",function(){
menu.classList.toggle("active");
});

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

window.open(
"https://wa.me/917733816532?text="+message,
"_blank"
);

}

const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");

document.querySelector(".cart-icon").addEventListener("click", function () {
  cartModal.style.display = "block";
});

closeCart.addEventListener("click", function () {
  cartModal.style.display = "none";
});

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
