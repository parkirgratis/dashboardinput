import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

// Add SweetAlert2 CSS
addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

// Show cancel confirmation alert
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
            window.location.href = 'index.html';
        }
    });
}

// Get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Capture Longitude and Latitude on map click
map.on('click', function (event) {
    const coordinate = ol.proj.toLonLat(event.coordinate);
    document.getElementById("long").value = coordinate[0].toFixed(6);
    document.getElementById("lat").value = coordinate[1].toFixed(6);
});

// Fetch data from Petapedia API
async function fetchDataFromPetapediaAPI() {
    const petapediaAPI = "https://asia-southeast2-awangga.cloudfunctions.net/petabackend/data/gis/lokasi";
    const token = getCookie("login");

    try {
        const response = await fetch(petapediaAPI, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "login": token // Send token in the 'login' header
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched data from petapedia API:", data);

        await sendDataToOwnAPI(data);
    } catch (error) {
        console.error("Error fetching data from petapedia API:", error.message);
        Swal.fire("Error", "Failed to fetch data from petapedia's API.", "error");
    }
}

// Send data to your backend
async function sendDataToOwnAPI(data) {
    const ownAPI = "https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/data/gis/lokasi";

    try {
        const response = await fetch(ownAPI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Data successfully sent to backend:", result);

        Swal.fire("Success", "Data successfully sent to backend.", "success");
    } catch (error) {
        console.error("Error sending data to backend:", error.message);
        Swal.fire("Error", "Failed to send data to backend.", "error");
    }
}

// Initialize map and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();

    const form = document.getElementById("locationForm");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            await fetchDataFromPetapediaAPI(); // Fetch and process data
        });
    }

    // Add event listener for the cancel button
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            cancel();
        });
    }
});
