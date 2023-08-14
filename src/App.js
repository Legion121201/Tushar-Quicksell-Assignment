import React, { useEffect, useState } from "react";

import Board from "./Components/Board/Board";

import "./App.css";
import Editable from "./Components/Editable/Editable";
import DropdownForm from "./Components/DropDown1/Dropdown1";
import DisplayButton from "./Components/DropDown1/DisplayButton";

function App() {
  const [boards, setBoards] = useState(
    JSON.parse(localStorage.getItem("prac-kanban")) || []
  );
  const [grouping, setGrouping] = useState("status"); // Default grouping
  const [sorting, setSorting] = useState("priority");
  const [selectedGrouping, setSelectedGrouping] = useState("status"); // Default sorting
  const [data, setData] = useState({ tickets: [], users: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://apimocha.com/quicksell/data");
        const responseData = await response.json();

        // for mapping users and tickets
        const userTicketsMap = responseData.users.reduce((map, user) => {
          map[user.id] = responseData.tickets.filter(
            (ticket) => ticket.userId === user.id
          );
          return map;
        }, {});

        // Associate tickets with users based on user IDs
        const usersWithTickets = responseData.users.map((user) => ({
          ...user,
          tickets: userTicketsMap[user.id] || []
        }));

        setData({
          tickets: responseData.tickets,
          users: usersWithTickets
        });

        // manipulating data as per requirements
        const manipulatedData = {
          tickets: responseData.tickets || [],
          users: usersWithTickets || []
        };

        // Pass the manipulated data to the groupAndSortData function
        const groupedAndSortedData = groupAndSortData(
          manipulatedData,
          selectedGrouping,
          sorting
        );

        setBoards(groupedAndSortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedGrouping, sorting]);

  const [targetCard, setTargetCard] = useState({
    bid: "",
    cid: ""
  });

  const addboardHandler = (name) => {
    const tempBoards = [...boards];
    tempBoards.push({
      id: Date.now() + Math.random() * 2,
      title: name,
      cards: []
    });
    setBoards(tempBoards);
  };

  const removeBoard = (id) => {
    const index = boards.findIndex((item) => item.id === id);
    if (index < 0) return;

    const tempBoards = [...boards];
    tempBoards.splice(index, 1);
    setBoards(tempBoards);
  };

  const dragEnded = (bid, cid) => {
    let s_boardIndex, s_cardIndex, t_boardIndex, t_cardIndex;
    s_boardIndex = boards.findIndex((item) => item.id === bid);
    if (s_boardIndex < 0) return;

    s_cardIndex = boards[s_boardIndex]?.cards?.findIndex(
      (item) => item.id === cid
    );
    if (s_cardIndex < 0) return;

    t_boardIndex = boards.findIndex((item) => item.id === targetCard.bid);
    if (t_boardIndex < 0) return;

    t_cardIndex = boards[t_boardIndex]?.cards?.findIndex(
      (item) => item.id === targetCard.cid
    );
    if (t_cardIndex < 0) return;

    const tempBoards = [...boards];
    const sourceCard = tempBoards[s_boardIndex].cards[s_cardIndex];
    tempBoards[s_boardIndex].cards.splice(s_cardIndex, 1);
    tempBoards[t_boardIndex].cards.splice(t_cardIndex, 0, sourceCard);
    setBoards(tempBoards);

    setTargetCard({
      bid: "",
      cid: ""
    });
  };

  const dragEntered = (bid, cid) => {
    if (targetCard.cid === cid) return;
    setTargetCard({
      bid,
      cid
    });
  };

  useEffect(() => {
    localStorage.setItem("prac-kanban", JSON.stringify(boards));
  }, [boards]);

  return (
    <div className="app">
      <div className="app_nav">
        <DisplayButton
          setGrouping={setSelectedGrouping}
          setSorting={setSorting}
        />
        {/* dropdown for grouping and ordering */}
        <DropdownForm
          grouping={grouping}
          sorting={sorting}
          setGrouping={setGrouping}
          setSorting={setSorting}
          selectedGrouping={selectedGrouping}
          setSelectedGrouping={setSelectedGrouping}
        />
      </div>
      <div className="app_boards_container">
        <div className="app_boards">
          {boards.map((item) => (
            <Board
              key={item.id} // Assign a unique key based on the item's id
              board={item}
              cards={item.cards}
              // addCard={addCardHandler}
              removeBoard={() => removeBoard(item.id)}
              // removeCard={removeCard}
              dragEnded={dragEnded}
              dragEntered={dragEntered}
              // updateCard={updateCard}
            />
          ))}
          <div className="app_boards_last"></div>
        </div>
      </div>
    </div>
  );
}

// main logic for grouping and sorting cards
function groupAndSortData(data, grouping, sorting) {
  // ... Perform grouping and sorting logic ...
  // Return the grouped and sorted data as an array of boards
  let groupedData = [];

  if (grouping === "status") {
    // Group by status
    groupedData = data.tickets.reduce((groups, ticket) => {
      const status = ticket.status;
      if (!groups[status]) {
        groups[status] = { id: status, title: status, cards: [] };
      }
      groups[status].cards.push(ticket);
      return groups;
    }, {});
  } else if (grouping === "user") {
    // Group by user
    groupedData = data.users.reduce((groups, user) => {
      const userId = user.id;
      if (!groups[userId]) {
        groups[userId] = { id: userId, title: user.name, cards: [] };
      }
      user.tickets = user.tickets || []; // Make sure user has tickets array
      user.tickets.forEach((ticketId) => {
        const ticket = data.tickets.find((t) => t.id === ticketId);
        if (ticket) {
          groups[userId].cards.push(ticket);
        }
      });
      return groups;
    }, {});
  } else if (grouping === "priority") {
    // Group by priority
    groupedData = data.tickets.reduce((groups, ticket) => {
      const priority = ticket.priority;
      const priorityLabel = getPriorityLabel(priority);
      if (!groups[priorityLabel]) {
        groups[priorityLabel] = {
          id: priority,
          title: priorityLabel,
          cards: []
        };
      }
      groups[priorityLabel].cards.push(ticket);
      return groups;
    }, {});
  }

  // Sorting logic
  for (const groupKey in groupedData) {
    if (groupedData.hasOwnProperty(groupKey)) {
      groupedData[groupKey].cards.sort((cardA, cardB) => {
        if (sorting === "priority") {
          return cardB.priority - cardA.priority;
        } else if (sorting === "title") {
          return cardA.title.localeCompare(cardB.title);
        }
        return 0;
      });
    }
  }
  //  labeling priority as per requirement
  function getPriorityLabel(priority) {
    switch (priority) {
      case 1:
        return "Urgent";
      case 2:
        return "High";
      case 3:
        return "Medium";
      case 4:
        return "Low";
      default:
        return "No priority";
    }
  }
  const sortedGroupedData = Object.values(groupedData);

  return sortedGroupedData;
}

export default App;
