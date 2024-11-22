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

            // Properti JSON disesuaikan dengan backend
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
                    Swal.fire("Success", "Data has been successfully saved!", "success");
                } else {
                    const errorMessage = await response.text();
                    Swal.fire("Error", `Failed to save data: ${errorMessage}`, "error");
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
