import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuctionWarRoom from "./AuctionWarRoom.jsx";
import { storage } from "./storage.js";

// Provide window.storage for the app's autosave (localStorage-backed).
if (typeof window !== "undefined" && !window.storage) {
  window.storage = storage;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuctionWarRoom />
  </StrictMode>
);
