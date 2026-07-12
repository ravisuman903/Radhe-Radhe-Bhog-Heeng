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

function addToCart(product, price){

cart.push({
product: product,
price: price
});

document.getElementById("cartCount").innerText = cart.length;

alert(product + " added to cart!");
}

function showCart(){

if(cart.length===0){
alert("Your cart is empty!");
return;
}

let message = "🛒 *My Order*%0A%0A";
let total = 0;

cart.forEach((item,index)=>{
message += (index+1)+". "+item.product+" - ₹"+item.price+"%0A";
total += item.price;
});

message += "%0A💰 Total = ₹"+total;

window.open(
"https://wa.me/917733816532?text="+message,
"_blank"
);

}
