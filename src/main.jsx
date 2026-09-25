import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import all CSS files to preserve design system completely
import "./styles/style.css";
import "./styles/responsive.css";
import "./styles/about.css";
import "./styles/contact.css";
import "./styles/markets.css";
import "./styles/produce.css";
import "./styles/bookmarks.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
