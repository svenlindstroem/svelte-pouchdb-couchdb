import App from "./App.svelte";

/* if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // register service worker
    navigator.serviceWorker.register("worker.js").then(
      function (registration) {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
} */

const app = new App({
  target: document.body,
});

// initialize all Materialize plugins
M.AutoInit();

export default app;
