console.log("Shifumi script loaded");

function initializeShifumi() {


   
  
}

if (window.location.pathname === "/shifumi") {
	initializeShifumi();
}

// Optional: expose initializePong for router.js to call directly
window.initializeShifumi = initializeShifumi;