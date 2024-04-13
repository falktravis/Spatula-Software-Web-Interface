import React from "react";
import ReactDom from "react-dom/client";
import App from "./App";
import './styles/main.scss';

const root = ReactDom.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);