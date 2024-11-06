import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Menambahkan CSS SweetAlert2
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Fungsi untuk menampilkan SweetAlert saat membatalkan
async function cancel() {
    Swal.fire({
        title: "Are you sure?",
        text: "The change won't be saved",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `Nevermind`,
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('cancelToast', 'true');
            window.location.href = 'admin.html';
        }
        // Jika pengguna menekan "Nevermind", tidak ada aksi yang dilakukan
    });
}

// Pastikan DOM sudah dimuat sebelum menambahkan event listener
document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen form dan tambahkan event listener untuk submit
    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); // Mencegah form submit default

            // Ambil nilai token, longitude, dan latitude dari form
            const token = document.getElementById("tokenForm").value;
            const longitude = parseFloat(document.getElementById("long").value);
            const latitude = parseFloat(document.getElementById("lat").value);

            // Validasi input longitude dan latitude
            if (isNaN(longitude) || isNaN(latitude)) {
                Swal.fire("Error", "Please enter valid longitude and latitude values", "error");
                return;
            }

            // Buat request data
            const requestData = {
                longitude,
                latitude,
            };

            try {
                const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/petabackend/data/gis/lokasi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "login": token, 
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch data. Status: " + response.status);
                }

                const data = await response.json();
                console.log("Data region:", data);

                // Tampilkan data yang diterima (contoh menggunakan SweetAlert)
                Swal.fire({
                    title: "Data Retrieved",
                    text: JSON.stringify(data),
                    icon: "success",
                });
            } catch (error) {
                console.error("Error occurred:", error);
                Swal.fire("Error", "There was an error retrieving the data.", "error");
            }
        });
    }

    // Tambahkan event listener untuk tombol cancel
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            cancel();
        });
    }
});
