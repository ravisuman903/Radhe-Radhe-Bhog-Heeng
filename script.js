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
