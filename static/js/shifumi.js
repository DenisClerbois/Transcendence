console.log("Shifumi script loaded");

function initializeShifumi() {


   
  
}

if (window.location.pathname === "/shifumi") { // Not neccessary, you can just call initialize directly
	initializeShifumi();
}

// I think useless
// Optional: expose initializePong for router.js to call directly
window.initializeShifumi = initializeShifumi;