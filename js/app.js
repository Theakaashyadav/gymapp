const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzadnBHadrc1hdvy24eYN6NmCzClgDN-ybjdAvRM7CPFhp_sJPV8HE_VsXvZ_wP02pk0A/exec";

console.log("✅ app.js loaded");

function apiRequest(data) {
  return new Promise((resolve) => {
    const callbackName =
      "jsonpCallback_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

    const script = document.createElement("script");
    const payload = encodeURIComponent(JSON.stringify(data));
    const url = `${SCRIPT_URL}?callback=${callbackName}&payload=${payload}`;

    let completed = false;

    window[callbackName] = function (response) {
      completed = true;
      cleanup();

      console.log("✅ API RESPONSE:", response);

      resolve(response || {
        status: "error",
        message: "Empty server response"
      });
    };

    script.onerror = function () {
      cleanup();
      resolve({
        status: "error",
        message: "Server request failed"
      });
    };

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    }

    script.src = url;
    document.body.appendChild(script);

    setTimeout(() => {
      if (!completed) {
        cleanup();
        resolve({
          status: "error",
          message: "Request timeout. Apps Script did not respond."
        });
      }
    }, 20000);
  });
}

function saveUser(user) {
  if (!user || !user.member_id) {
    console.error("Invalid user object:", user);
    throw new Error("member_id missing");
  }

  localStorage.setItem("gymUser", JSON.stringify(user));
}

function getUser() {
  try {
    const rawUser = localStorage.getItem("gymUser");

    if (!rawUser) return null;

    const user = JSON.parse(rawUser);

    if (!user || !user.member_id) {
      localStorage.removeItem("gymUser");
      return null;
    }

    return user;
  } catch (err) {
    console.error("❌ getUser error:", err);
    localStorage.removeItem("gymUser");
    return null;
  }
}

function logout() {
  localStorage.removeItem("gymUser");
  window.location.href = "index.html";
}

function protectPage() {
  const user = getUser();

  if (!user) {
    window.location.replace("./index.html");
    return false;
  }

  return true;
}

function showUserName() {
  const user = getUser();
  const nameElements = document.querySelectorAll("[data-user-name]");

  nameElements.forEach((el) => {
    el.textContent = user && user.name ? user.name : "Member";
  });
}