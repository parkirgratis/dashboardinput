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
    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent default form submission

            const token = getCookie("login");
            const longitude = parseFloat(document.getElementById("long").value);
            const latitude = parseFloat(document.getElementById("lat").value);

            if (isNaN(longitude) || isNaN(latitude)) {
                Swal.fire("Error", "Please enter valid longitude and latitude values", "error");
                return;
            }

            const requestData = { longitude, latitude };

            try {
                // Simulate sending data to a server (replace with actual API call)
                const response = await fetch("https://your-api-endpoint.example.com/save-location", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    Swal.fire("Success", "Data has been successfully saved!", "success");
                } else {
                    const errorMessage = await response.text();
                    Swal.fire("Error", `Failed to save data: ${errorMessage}`, "error");
                }
            } catch (error) {
                Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
            }
        });
    }

    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancel);
    }
});
