// ==========================
// Mobile Navigation
// ==========================

const hamburger = document.querySelector(".hamburger");

const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {

    navLinks.classList.toggle("active");

});

// ==========================
// Sticky Navbar
// ==========================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.boxShadow = "0 10px 25px rgba(0,0,0,.08)";

    } else {

        header.style.boxShadow = "none";

    }

});

// ==========================
// Dark Mode
// ==========================

const darkBtn = document.querySelector(".dark-toggle");

darkBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

});

// ==========================
// Cart Counter (LocalStorage)
// ==========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.getElementById("cart-count").innerText = cart.length;


/*==================================================
                WAGGON
        Premium Ecommerce Website
        Main JavaScript
==================================================*/

"use strict";

/*==================================================
                DOM ELEMENTS
==================================================*/

const body = document.body;

const header = document.querySelector(".header");

const navbar = document.querySelector(".navbar");

const menuBtn = document.querySelector(".menu-toggle");

const navLinks = document.querySelector(".nav-links");

const loader = document.querySelector(".loader");

const backToTop = document.getElementById("backToTop");

const searchBtn = document.querySelector(".search-btn");

const cartBtn = document.querySelector(".cart-btn");

const wishlistBtn = document.querySelector(".wishlist-btn");

const darkModeBtn = document.querySelector(".dark-mode-btn");

/*==================================================
                VARIABLES
==================================================*/

let lastScroll = 0;

let menuOpen = false;

/*==================================================
                LOADER
==================================================*/

window.addEventListener("load", () => {

    if (!loader) return;

    setTimeout(() => {

        loader.classList.add("hide");

    }, 700);

});

/*==================================================
                STICKY NAVBAR
==================================================*/

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 60) {

        header.classList.add("sticky");

    } else {

        header.classList.remove("sticky");

    }

});

/*==================================================
        NAVBAR HIDE / SHOW
==================================================*/

window.addEventListener("scroll", () => {

    const current = window.pageYOffset;

    if (!header) return;

    if (current > lastScroll && current > 150) {

        header.classList.add("hide");

    } else {

        header.classList.remove("hide");

    }

    lastScroll = current;

});

/*==================================================
            MOBILE MENU
==================================================*/

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        menuOpen = !menuOpen;

        navLinks.classList.toggle("active");

        menuBtn.classList.toggle("active");

        body.classList.toggle("menu-open");

    });

}

/*==================================================
        CLOSE MENU AFTER CLICK
==================================================*/

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        if (!menuOpen) return;

        menuOpen = false;

        navLinks.classList.remove("active");

        menuBtn.classList.remove("active");

        body.classList.remove("menu-open");

    });

});

/*==================================================
            SMOOTH SCROLL
==================================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({

            behavior: "smooth"

        });

    });

});

/*==================================================
        ACTIVE NAVIGATION
==================================================*/

const sections = document.querySelectorAll("section");

const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const top = section.offsetTop - 150;

        const height = section.clientHeight;

        if (pageYOffset >= top) {

            current = section.getAttribute("id");

        }

    });

    navItems.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

/*==================================================
            BACK TO TOP
==================================================*/

if (backToTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*==================================================
            HELPERS
==================================================*/

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);

function clamp(value, min, max) {

    return Math.min(Math.max(value, min), max);

}

function debounce(callback, delay = 200) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

function throttle(callback, delay = 100) {

    let waiting = false;

    return (...args) => {

        if (waiting) return;

        callback(...args);

        waiting = true;

        setTimeout(() => {

            waiting = false;

        }, delay);

    };

}

console.log(
`
====================================

        WAGGON STORE

 Premium Ecommerce Frontend Loaded

====================================
`
);

/*==================================================
        SCROLL REVEAL ANIMATION
==================================================*/

const revealElements = document.querySelectorAll(
`
.fade-up,
.fade-left,
.fade-right,
.zoom-in
`
);

const revealObserver = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("reveal");

}

});

},

{
threshold:0.15
}

);

revealElements.forEach(element=>{

revealObserver.observe(element);

});

/*==================================================
            COUNTER ANIMATION
==================================================*/

const counters = document.querySelectorAll(".counter");

function animateCounter(counter){

const target = Number(counter.dataset.target);

let current = 0;

const increment = Math.ceil(target / 120);

const timer = setInterval(()=>{

current += increment;

if(current >= target){

current = target;

clearInterval(timer);

}

counter.textContent = current.toLocaleString();

},16);

}

const counterObserver = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

animateCounter(entry.target);

counterObserver.unobserve(entry.target);

}

});

},

{
threshold:.5
}

);

counters.forEach(counter=>{

counterObserver.observe(counter);

});

/*==================================================
            MOUSE PARALLAX
==================================================*/

const hero = document.querySelector(".hero");

const floatingCards = document.querySelectorAll(".floating-card");

if(hero){

hero.addEventListener("mousemove",(event)=>{

const x = event.clientX / window.innerWidth;

const y = event.clientY / window.innerHeight;

floatingCards.forEach((card,index)=>{

const speed = (index+1) * 18;

const moveX = (x - .5) * speed;

const moveY = (y - .5) * speed;

card.style.transform =

`
translate(${moveX}px,${moveY}px)
`;

});

});

hero.addEventListener("mouseleave",()=>{

floatingCards.forEach(card=>{

card.style.transform="translate(0,0)";

});

});

}

/*==================================================
            3D PRODUCT TILT
==================================================*/

const productCards = document.querySelectorAll(".product-card");

productCards.forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;

const y = e.clientY - rect.top;

const centerX = rect.width / 2;

const centerY = rect.height / 2;

const rotateX =

-(y-centerY)/18;

const rotateY =

(x-centerX)/18;

card.style.transform=

`
perspective(1000px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-10px)
`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

/*==================================================
            FLOAT ANIMATION
==================================================*/

floatingCards.forEach((card,index)=>{

card.animate(

[
{
transform:"translateY(0px)"
},
{
transform:"translateY(-18px)"
},
{
transform:"translateY(0px)"
}
],

{

duration:3500+(index*600),

iterations:Infinity,

easing:"ease-in-out"

}

);

});

/*==================================================
            RIPPLE BUTTON EFFECT
==================================================*/

const rippleButtons = document.querySelectorAll(

".btn,.btn-primary,.btn-outline"

);

rippleButtons.forEach(button=>{

button.addEventListener("click",(event)=>{

const ripple=document.createElement("span");

const rect=button.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

const x=event.clientX-rect.left-size/2;

const y=event.clientY-rect.top-size/2;

ripple.className="ripple";

ripple.style.width=size+"px";

ripple.style.height=size+"px";

ripple.style.left=x+"px";

ripple.style.top=y+"px";

button.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});

});

/*==================================================
                TYPING EFFECT
==================================================*/

const typingElement = document.querySelector(".typing");

if(typingElement){

const words=[

"Premium Fashion",

"Custom T-Shirts",

"Streetwear",

"Luxury Apparel",

"Design Your Style"

];

let wordIndex=0;

let letterIndex=0;

let deleting=false;

function type(){

const currentWord=words[wordIndex];

if(!deleting){

typingElement.textContent=

currentWord.substring(0,letterIndex);

letterIndex++;

if(letterIndex>currentWord.length){

deleting=true;

setTimeout(type,1500);

return;

}

}else{

typingElement.textContent=

currentWord.substring(0,letterIndex);

letterIndex--;

if(letterIndex<0){

deleting=false;

wordIndex++;

if(wordIndex>=words.length){

wordIndex=0;

}

}

}

setTimeout(type,deleting?45:110);

}

type();

}

/*==================================================
        BUTTON HOVER LIFT
==================================================*/

document.querySelectorAll(

".btn,.product-card,.feature-card"

).forEach(element=>{

element.addEventListener("mouseenter",()=>{

element.style.transition=".35s";

});

});

/*==================================================
        IMAGE LAZY FADE
==================================================*/

const images=document.querySelectorAll("img");

const imageObserver=new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("loaded");

imageObserver.unobserve(entry.target);

}

});

},

{
threshold:.1
}

);

images.forEach(image=>{

imageObserver.observe(image);

});

/*==================================================
            PAGE READY
==================================================*/

console.log(

"Animations Loaded Successfully"

);

