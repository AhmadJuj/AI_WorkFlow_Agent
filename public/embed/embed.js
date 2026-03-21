(function () {
  var script = document.currentScript;
  var workflowId = (script && script.getAttribute("data-workflow-id")) || "";
  var scriptSrc = script && script.src;
  var baseUrl = scriptSrc
    ? scriptSrc.substring(0, scriptSrc.lastIndexOf("/"))
    : "";
  var chatSVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 70 56" class="nuxt-icon" height="30px" width="30px">' +
    '<path fill="white" d="m27.377 44.368 11.027 11.53 8.597-13.663 22.813-2.48L66.132.284.214 7.447 3.895 46.92l23.482-2.552Z"/>' +
    "</svg>";

  var closeSVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" height="30px" width="30px">' +
    '<path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";
  var mobileBreakpoint = 480;

  function getInset() {
    return window.innerWidth <= mobileBreakpoint ? 12 : 24;
  }

  function getButtonSize() {
    return window.innerWidth <= mobileBreakpoint ? 52 : 56;
  }

  // Create floating button
  var btn = document.createElement("button");
  btn.innerHTML = chatSVG;
  var initialInset = getInset();
  var initialButtonSize = getButtonSize();
  Object.assign(btn.style, {
    position: "fixed",
    bottom: initialInset + "px",
    right: initialInset + "px",
    zIndex: "999999",
    width: initialButtonSize + "px",
    height: initialButtonSize + "px",
    padding: "0",
    borderRadius: "50%",
    background: "#6366f1",
    border: "none",
    boxShadow: "0 2px 8px #0002",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  });
  document.body.appendChild(btn);
  // Preload iframe immediately
  var iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/index.html?workflow_id=" + workflowId;
  function applyResponsiveLayout() {
    var inset = getInset();
    var buttonSize = getButtonSize();
    var panelBottom = inset + buttonSize + 10;

    btn.style.bottom = inset + "px";
    btn.style.right = inset + "px";
    btn.style.width = buttonSize + "px";
    btn.style.height = buttonSize + "px";

    iframe.style.bottom = panelBottom + "px";
    iframe.style.right = inset + "px";
    iframe.style.width = "min(370px, calc(100vw - " + inset * 2 + "px))";
    iframe.style.height = "min(570px, calc(100vh - " + (panelBottom + inset) + "px))";
    iframe.style.borderRadius = window.innerWidth <= mobileBreakpoint ? "12px" : "16px";
  }
  Object.assign(iframe.style, {
    visibility: "hidden",
    pointerEvents: "none",
    position: "fixed",
    bottom: "90px",
    right: "24px",
    width: "370px",
    height: "570px",
    zIndex: "99999",
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 32px #0003",
    background: "#fff",
    opacity: "0",
    transition: "opacity 0.2s ease-in-out",
  });
  iframe.onload = function () {
    iframe.style.opacity = "1";
  };
  document.body.appendChild(iframe);
  applyResponsiveLayout();
  window.addEventListener("resize", applyResponsiveLayout);
  btn.onclick = function () {
    var isOpen = iframe.style.visibility === "visible";

    if (isOpen) {
      iframe.style.visibility = "hidden";
      iframe.style.pointerEvents = "none";
      btn.innerHTML = chatSVG;
    } else {
      iframe.style.visibility = "visible";
      iframe.style.pointerEvents = "auto";
      btn.innerHTML = closeSVG;
    }
  };
})();