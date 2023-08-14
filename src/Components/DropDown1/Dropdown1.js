import React, { useState } from "react";
import "./Dropdown1.css";

// the dropdown option selection part
const DropdownForm = ({
  selectedGrouping,
  setSelectedGrouping,
  setSorting,
  sorting
}) => {
  const [grouping, setGrouping] = useState(selectedGrouping);
  const [ordering, setOrdering] = useState("asc");

  const handleGroupingChange = (event) => {
    const newGrouping = event.target.value;
    setGrouping(newGrouping);
    setSelectedGrouping(event.target.value);
  };

  const handleOrderingChange = (event) => {
    const newOrdering = event.target.value;
    setOrdering(event.target.value);
    setSorting(newOrdering);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Do something with the selected options
    console.log("Grouping:", selectedGrouping);
    console.log("Ordering:", ordering);
  };

  return (
    <div className="form-container" id="form-container">
      <form onSubmit={handleSubmit}>
        <div className="x1">
          <label htmlFor="grouping">Grouping</label>
          <select
            id="grouping"
            name="grouping"
            value={selectedGrouping}
            onChange={handleGroupingChange}
            className="op1"
          >
            <option value="status">Status</option>
            <option value="user">User</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div>
          <label htmlFor="ordering">Ordering</label>
          <select
            id="ordering"
            name="ordering"
            value={ordering}
            onChange={handleOrderingChange}
            className="op2"
          >
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
        <br />
        <br />
      </form>
    </div>
  );
};

export default DropdownForm;
