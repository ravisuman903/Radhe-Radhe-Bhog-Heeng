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

let cart = [];

function addToCart(button, product, price){

let qty = parseInt(
button.parentElement.querySelector(".qty").innerText
);

cart.push({
product: product,
price: price,
qty: qty
});

document.getElementById("cartCount").innerText = cart.length;

alert(product + " x " + qty + " added to cart!");
updateCartPopup();
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

message += "%0A💰 *Total = ₹"+total+"*";

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
<div>₹${itemTotal}</div>
</div>
`;

});

cartTotal.innerText=total;

}
