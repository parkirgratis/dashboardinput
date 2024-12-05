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
async function handleSubmitPetapedia(event) {
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

async function insertRegionDataParking() {
    const regionData = {
        province: document.getElementById("province").value,
        district: document.getElementById("district").value,
        sub_district: document.getElementById("sub_district").value,
        village: document.getElementById("village").value,
        latitude: parseFloat(document.getElementById("lat").value),
        longitude: parseFloat(document.getElementById("long").value),
    };
    if (
        !regionData.province || 
        !regionData.district || 
        !regionData.sub_district || 
        !regionData.village
    ) {
        Swal.fire("Error", "Semua field wajib diisi!", "error");
        return;
    }
    
    if (
        isNaN(regionData.latitude) || regionData.latitude < -90 || regionData.latitude > 90 || 
        isNaN(regionData.longitude) || regionData.longitude < -180 || regionData.longitude > 180
    ) {
        Swal.fire("Error", "Latitude harus antara -90 dan 90, dan Longitude antara -180 dan 180.", "error");
        return;
    }

    console.log("Region Data to be sent:", JSON.stringify(regionData));

    try {
        const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/data/gis/lokasi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(regionData)
        });

        const result = await response.json();
        if (response.ok) {
            Swal.fire("Success", "Data berhasil disimpan: " + JSON.stringify(result), "success");
        } else {
            console.error("Error response:", result);
            Swal.fire("Error", `Failed to save data: ${JSON.stringify(result)}`, "error");
        }
    } catch (error) {
        console.error("Network error:", error);
        Swal.fire("Error", "Terjadi kesalahan jaringan: " + error.message, "error");
    }
}


// Event listener untuk form dan tombol cancel
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", handleSubmitPetapedia);
    }

    const saveButton = document.getElementById("saveButton");
    if (saveButton) {
        saveButton.addEventListener("click", insertRegionDataParking);
    }
    
    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancel);
    }
});
