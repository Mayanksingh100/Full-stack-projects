/*
console.log("Order");
setTimeout(() => {
    console.log("Preparing order");
},0);
console.log("Next order");

*/
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "data.json");


const data = fs.readFileSync(filePath, "utf-8");
const application = JSON.parse(data).application;
console.log(application);