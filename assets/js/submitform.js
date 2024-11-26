import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

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

async function sendFreeParkingData(long, lat) {
    const freeParkingAPI = "https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/data/gis/lokasi";
    const requestData = { longitude: parseFloat(long), latitude: parseFloat(lat) };

    try {
        console.log("Sending data to Free Parking API:", requestData);

        const response = await fetch(freeParkingAPI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const error = await response.json();
            Swal.fire("Error", `API Error: ${error.message || error}`, "error");
            return;
        }

        const result = await response.json();
        Swal.fire("Success", "Free parking data successfully sent.", "success");
    } catch (error) {
        console.error("Network error:", error.message);
        Swal.fire("Error", "Failed to send data to API.", "error");
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const submitButton = event.target.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    const token = getCookie("login");
    if (!token) {
        Swal.fire("Error", "User is not authenticated. Please log in.", "error");
        return;
    }

    const longitude = parseFloat(document.getElementById("long").value);
    const latitude = parseFloat(document.getElementById("lat").value);

    if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        Swal.fire("Error", "Please enter valid longitude and latitude values within range", "error");
        return;
    }

    const requestData = { longitude, latitude };

    try {
        const gisResponse = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/petabackend/data/gis/lokasi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "login": token,
            },
            body: JSON.stringify(requestData),
        });

        if (gisResponse.ok) {
            Swal.fire("Success", "Data has been successfully saved to GIS!", "success");
            await sendFreeParkingData(longitude, latitude);
        } else {
            const error = await gisResponse.json();
            Swal.fire("Error", `Failed to save data to GIS: ${error.message || error}`, "error");
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }

    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancel);
    }
});
