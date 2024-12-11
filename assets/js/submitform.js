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
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return value;
        }
    }
    return null;
}

async function handleSubmitPetapedia(event) {
    event.preventDefault();

    const token = getCookie("login");
    const longitude = parseFloat(document.getElementById("long").value);
    const latitude = parseFloat(document.getElementById("lat").value);

    if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        Swal.fire("Error", "Please enter valid longitude and latitude values within valid ranges.", "error");
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
            const result = await response.json();
            document.getElementById("province").value = result.province || "";
            document.getElementById("district").value = result.district || "";
            document.getElementById("sub_district").value = result.sub_district || "";
            document.getElementById("village").value = result.village || "";
            Swal.fire("Success", "Data successfully fetched from GIS.", "success");
        } else {
            const error = await response.json();
            Swal.fire("Error", `Failed to fetch data: ${JSON.stringify(error)}`, "error");
        }
    } catch (error) {
        Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
    }
}

async function uploadImage() {
    const imageInput = document.getElementById("gambar");
    if (!imageInput || imageInput.files.length === 0) {
        console.error("No image file selected.");
        Swal.fire("Error", "Please select an image to upload.", "error");
        throw new Error("No image selected.");
    }

    const formData = new FormData();
    formData.append("img", imageInput.files[0]);

    const targetUrl = "https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/upload/img";
    const response = await fetch(targetUrl, { method: "POST", body: formData });
    console.log(await response.text());

    const result = await response.json();
    if (response.ok && result.url) {
        return result.url;
    } else {
        console.error("Upload failed:", result);
        throw new Error("Failed to upload image.");
    }
}

async function insertRegionDataParking() {
    try {
        const regionData = {
            province: document.getElementById("province").value,
            district: document.getElementById("district").value,
            sub_district: document.getElementById("sub_district").value,
            village: document.getElementById("village").value,
            latitude: parseFloat(document.getElementById("lat").value),
            longitude: parseFloat(document.getElementById("long").value),
            nama_tempat: document.getElementById("nama_tempat").value,
            lokasi: document.getElementById("lokasi").value,
            fasilitas: document.getElementById("fasilitas").value,
        };

        
        if (Object.values(regionData).some((value) => !value)) {
            Swal.fire("Error", "All fields are required.", "error");
            return;
        }
        regionData.gambar = await uploadImage();

        
        const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/tampat-parkir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regionData),
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire("Success", `Data successfully saved: ${JSON.stringify(result)}`, "success");
        } else {
            console.error("Failed to save data:", await response.text());
            Swal.fire("Error", "Failed to save data.", "error");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        Swal.fire("Error", `An error occurred: ${error.message}`, "error");
    }
    
}


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
