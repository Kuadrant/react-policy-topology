// src/App.js
import React, { useState, useEffect } from "react";
import PolicyTopology from "./PolicyTopology.js";
import * as dot from "graphlib-dot"; // Needed to parse dotString
import "./App.css";

function App({ config }) { // Receive config as a prop
  const [dotString, setDotString] = useState("");
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    let ws;

    const connectWebSocket = () => {
      const { WEBSOCKET_HOST, WEBSOCKET_PORT } = config; // Destructure config
      const wsUrl = `ws://${WEBSOCKET_HOST}:${WEBSOCKET_PORT}/ws`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (event) => {
        try {
          const data = event.data;
          console.log("WebSocket message received:", data);
          setDotString(data);

          const parsedGraph = dot.read(data);
          setGraph(parsedGraph);
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.warn("WebSocket closed. Attempting to reconnect...");
        setTimeout(connectWebSocket, 3000); // Retry after 3 seconds
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Close the connection on error to trigger reconnection
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [config]); // Re-run effect if config changes

  return (
    <div className="App">
      <header className="App-header">
        <h1>Policy Machinery</h1>
        <PolicyTopology initialDotString={dotString} />
      </header>
    </div>
  );
}

export default App;
