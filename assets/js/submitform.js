import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Add SweetAlert2 CSS
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Fungsi untuk menampilkan dialog konfirmasi pembatalan
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

// Fungsi untuk mendapatkan cookie tertentu
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return value;
        }
    }
    return null;
}
// Fungsi untuk menangani pengiriman data
async function handleSubmit(event) {
    event.preventDefault();

    const token = getCookie("login");
    const longitude = parseFloat(document.getElementById("long").value);
    const latitude = parseFloat(document.getElementById("lat").value);

    if (isNaN(longitude) || isNaN(latitude)) {
        Swal.fire("Error", "Please enter valid longitude and latitude values", "error");
        return;
    }

    const requestData = { long: longitude, lat: latitude };

    try {
        // Kirim data ke Petapedia API
        const gisResponse = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/petabackend/data/gis/lokasi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "login": token,
            },
            body: JSON.stringify(requestData),
        });

        if (gisResponse.ok) {
            const gisResult = await gisResponse.json();

            console.log("Hasil GIS:", gisResult);

            // Isi otomatis form dengan data dari Petapedia
            document.getElementById("province").value = gisResult.province || "";
            document.getElementById("district").value = gisResult.district || "";
            document.getElementById("sub_district").value = gisResult.sub_district || "";
            document.getElementById("village").value = gisResult.village || "";

            Swal.fire("Success", "Data berhasil diisi dari GIS Petapedia. Silakan klik Save untuk menyimpan ke Parkir Gratis.", "success");

        } else {
            const errorMessage = await gisResponse.json();
            console.error("Failed to save data to GIS:", errorMessage);
            Swal.fire("Error", `Failed to save data to GIS: ${JSON.stringify(errorMessage)}`, "error");
        }
    } catch (error) {
        console.error("Error during submission:", error.message);
        Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
    }
}

// Event listener untuk form dan tombol cancel
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }

    const saveButton = document.getElementById("saveButton");
    if (saveButton) {
        saveButton.addEventListener("click", handleSave);
    }
    
    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancel);
    }
});
