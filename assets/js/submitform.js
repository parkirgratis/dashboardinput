import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Add SweetAlert2 CSS
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

// Fungsi untuk mengirim data ke endpoint parkir gratis
async function sendFreeParkingData(long, lat) {
    const freeParkingAPI = "https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/data/gis/lokasi";

    const requestData = { longitude: long, latitude: lat };

    try {
        const response = await fetch(freeParkingAPI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Free parking data successfully sent:", result);

        Swal.fire("Success", "Free parking data successfully sent to backend.", "success");
    } catch (error) {
        console.error("Error sending free parking data:", error.message);
        Swal.fire("Error", "Failed to send free parking data to backend.", "error");
    }
}

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

            const requestData = { long: longitude, lat: latitude };

            try {
                // Kirim data ke endpoint GIS
                const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/petabackend/data/gis/lokasi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "login": token,
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    Swal.fire("Success", "Data has been successfully saved to GIS!", "success");

                    // Kirim data ke endpoint parkir gratis
                    await sendFreeParkingData(longitude, latitude);
                } else {
                    const errorMessage = await response.text();
                    Swal.fire("Error", `Failed to save data to GIS: ${errorMessage}`, "error");
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
