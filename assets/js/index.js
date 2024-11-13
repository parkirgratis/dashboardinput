//lib call
import {getCookie} from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";


//check cookie login
if (getCookie("login")===""){
    redirect("/signin");
}

getJSON("https://asia-southeast2-awangga.cloudfunctions.net/parkirgratis/data/user","login",getCookie("login"));