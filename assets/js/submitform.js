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

// Fungsi untuk mengirim data ke endpoint Parkir Gratis
async function sendFreeParkingData(long, lat) {
    const freeParkingAPI = "https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/data/gis/lokasi";

    // Ambil data dari localStorage
    const locationData = JSON.parse(localStorage.getItem("petapediaData"));

    if (!locationData || !locationData.province || !locationData.district || !locationData.sub_district || !locationData.village) {
        Swal.fire("Error", "Region data is incomplete. Please ensure Petapedia data is available.", "error");
        return;
    }

    const { province, district, sub_district, village } = locationData;

    const requestData = {
        long: parseFloat(long),
        lat: parseFloat(lat),
        province,
        district,
        sub_district,
        village,
    };

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
            const errorMessage = await response.text();
            console.error("Error from Free Parking API:", errorMessage);
            Swal.fire("Error", `API Error: ${errorMessage}`, "error");
            return;
        }

        const result = await response.json();
        console.log("Data successfully sent to Free Parking API:", result);
        Swal.fire("Success", "Free parking data successfully sent.", "success");

        // Hapus data dari localStorage setelah berhasil dikirim
        localStorage.removeItem("petapediaData");

    } catch (error) {
        console.error("Network error:", error.message);
        Swal.fire("Error", "Failed to send data to API.", "error");
    }
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
        // Kirim data ke endpoint GIS Petapedia
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

            const { province, district, sub_district, village } = gisResult;

            // Simpan data ke localStorage
            localStorage.setItem("petapediaData", JSON.stringify({ province, district, sub_district, village }));

            console.log("Data lokasi berhasil disimpan ke localStorage:", { province, district, sub_district, village });

            // Kirim data ke Parkir Gratis API
            await sendFreeParkingData(longitude, latitude);

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

    const cancelButton = document.getElementById("cancelButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancel);
    }
});
