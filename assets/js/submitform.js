import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";
import { APIs } from "../js/config.js"

// Add SweetAlert2 CSS
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Validate input
function validateInput(longitude, latitude) {
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        Swal.fire("Error", "Please enter valid longitude and latitude values", "error");
        return false;
    }
    return true;
}

// Show confirmation dialog
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

// Fetch cookies
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}

// Send Free Parking Data
async function sendFreeParkingData(long, lat, province, district, sub_district, village) {
    if (!province || !district || !sub_district || !village) {
        Swal.fire("Error", "Region data is incomplete.", "error");
        return;
    }

    Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(APIs.FreeParking, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ long, lat, province, district, sub_district, village }),
        });

        if (!response.ok) throw new Error(await response.text());

        Swal.fire("Success", "Free parking data successfully sent.", "success");
    } catch (error) {
        Swal.fire("Error", "Failed to send data to API.", "error");
    } finally {
        Swal.close();
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    const token = getCookie("login");
    if (!token) {
        Swal.fire("Error", "You must be logged in to submit data.", "error");
        return;
    }

    const longitude = parseFloat(document.getElementById("long").value);
    const latitude = parseFloat(document.getElementById("lat").value);

    if (!validateInput(longitude, latitude)) return;

    try {
        Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const gisResponse = await fetch(APIs.GIS, {
            method: "POST",
            headers: { "Content-Type": "application/json", "login": token },
            body: JSON.stringify({ long: longitude, lat: latitude }),
        });

        if (!gisResponse.ok) throw new Error("Failed to save data to GIS");

        const gisResult = await gisResponse.json();
        const { province, district, sub_district, village } = gisResult;

        if (!province || !district || !sub_district || !village) {
            Swal.fire("Error", "GIS API did not return complete region data.", "error");
            return;
        }

        await sendFreeParkingData(longitude, latitude, province, district, sub_district, village);

        Swal.fire("Success", "Data successfully saved to GIS and Free Parking API!", "success");
    } catch (error) {
        Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
    } finally {
        Swal.close();
    }
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("locationForm")?.addEventListener("submit", handleSubmit);
    document.getElementById("cancelButton")?.addEventListener("click", cancel);
});
