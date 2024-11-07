//lib call
import {getCookie} from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";


//check cookie login
if (getCookie("login")===""){
    redirect("/signin");
}

//logic logout
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    Cookies.remove("login", {
      path: "/",
    });
    Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You have been successfully logged out",
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      window.location.href = "/";
    });
  });
}