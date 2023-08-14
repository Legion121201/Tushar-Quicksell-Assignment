import React, { useState } from "react";
import ToggleForm from "./click";
import "./DisplayButton.css";

// button to open form for dropdown option selection

function toggleForm() {
  const form = document.getElementById("form-container");
  if (form.style.display === "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}
function DisplayButton() {
  return (
    <div>
      <button className="display-button" onClick={toggleForm}>
        &#9781; Display ▼
      </button>
    </div>
  );
}

export default DisplayButton;
