import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Tambahkan CSS untuk SweetAlert2
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Fungsi untuk membatalkan perubahan
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

// Fungsi untuk mendapatkan nilai cookie tertentu
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

// Fungsi untuk menangani submit GIS Petapedia
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
        const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/petabackend/data/gis/lokasi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "login": token,
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            ["province", "district", "sub_district", "village"].forEach((field) => {
                document.getElementById(field).value = data[field] || "";
            });
            Swal.fire("Success", "Data berhasil diisi. Klik Save untuk menyimpan.", "success");
        } else {
            const errorMessage = await response.json();
            console.error("Failed to fetch GIS data:", errorMessage);
            Swal.fire("Error", "Failed to fetch GIS data.", "error");
        }
    } catch (error) {
        console.error("Error during GIS submission:", error.message);
        Swal.fire("Error", "Unexpected error occurred. Please try again.", "error");
    }
}

// Fungsi untuk menyimpan data lokasi parkir
async function insertRegionDataParking() {
    const fields = ["province", "district", "sub_district", "village", "lat", "long", "nama_tempat", "lokasi", "fasilitas"];
    const data = {};
    fields.forEach((field) => {
        data[field] = document.getElementById(field).value;
    });

    data.latitude = parseFloat(data.lat);
    data.longitude = parseFloat(data.long);

    if (!data.province || !data.district || !data.sub_district || !data.village) {
        Swal.fire("Error", "Semua field wajib diisi!", "error");
        return;
    }

    if (isNaN(data.latitude) || isNaN(data.longitude)) {
        Swal.fire("Error", "Longitude dan Latitude harus berupa angka!", "error");
        return;
    }

    const imageInput = document.getElementById("gambar");
    const imageFile = imageInput.files[0];
    if (!imageFile) {
        Swal.fire("Error", "Silakan pilih file gambar terlebih dahulu.", "error");
        return;
    }

    if (!["image/jpeg", "image/png"].includes(imageFile.type) || imageFile.size > 5 * 1024 * 1024) {
        Swal.fire("Error", "File harus berupa JPG/PNG dan maksimal 5MB.", "error");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("file", imageFile);

        const imageResponse = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/upload/img", {
            method: "POST",
            body: formData,
        });

        if (imageResponse.ok) {
            const { url } = await imageResponse.json();
            data.gambar = url;

            const saveResponse = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/tempat-parkir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (saveResponse.ok) {
                const result = await saveResponse.json();
                Swal.fire("Success", `Data berhasil disimpan: ${JSON.stringify(result)}`, "success");
            } else {
                const errorResult = await saveResponse.json();
                Swal.fire("Error", `Failed to save data: ${JSON.stringify(errorResult)}`, "error");
            }
        } else {
            Swal.fire("Error", "Gagal mengupload gambar!", "error");
        }
    } catch (error) {
        console.error("Error during submission:", error.message);
        Swal.fire("Error", `Kesalahan jaringan: ${error.message}`, "error");
    }
}

// Tambahkan event listener setelah DOM dimuat
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("locationForm")?.addEventListener("submit", handleSubmitPetapedia);
    document.getElementById("saveButton")?.addEventListener("click", insertRegionDataParking);
    document.getElementById("cancelButton")?.addEventListener("click", cancel);
});
