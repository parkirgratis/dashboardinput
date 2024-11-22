import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Add SweetAlert2 CSS
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Function to show SweetAlert on cancel
async function cancel() {
    Swal.fire({
        title: "Are you sure?",
        text: "The change won't be saved",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "Nevermind",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem("cancelToast", "true");
            window.location.href = "index.html";
        }
        // No action if "Nevermind" is selected
    });
}

// Function to retrieve a specific cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

// Ensure DOM is loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Get form element and add event listener for submit
    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent default form submission

            // Retrieve token from cookies
            const token = getCookie("login");
            const longitude = parseFloat(document.getElementById("long").value);
            const latitude = parseFloat(document.getElementById("lat").value);

            // Validate longitude and latitude input
            if (isNaN(longitude) || isNaN(latitude)) {
                Swal.fire("Error", "Please enter valid longitude and latitude values", "error");
                return;
            }

            // Create request data
            const requestData = { longitude, latitude };

            // You can add logic here to process `requestData` using the token
        });
    }

    // Add event listener for the cancel button
    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancel);
    }
});
