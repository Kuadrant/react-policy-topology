import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import "d3-graphviz"; // registers .graphviz() on d3 selections
import { Button } from "@patternfly/react-core";
import graphlib from "graphlib";
import * as dot from "graphlib-dot";
import "./PolicyTopology.css";

const PolicyTopology = ({ initialDotString }) => {
  const containerRef = useRef(null);
  const [dotString, setDotString] = useState(initialDotString);
  const [graph, setGraph] = useState(null);

  // Function to update graph when a node is selected
  const handleNodeSelection = useCallback(
    (nodeId) => {
      if (!graph) return;

      const filteredGraph = new graphlib.Graph();
      const nodesToInclude = new Set();

      const addPredecessors = (node) => {
        if (!nodesToInclude.has(node)) {
          nodesToInclude.add(node);
          const predecessors = graph.predecessors(node) || [];
          predecessors.forEach(addPredecessors);
        }
      };

      const addSuccessors = (node) => {
        const successors = graph.successors(node) || [];
        successors.forEach((successor) => {
          nodesToInclude.add(successor);
        });
      };

      addPredecessors(nodeId);
      addSuccessors(nodeId);

      nodesToInclude.forEach((node) => {
        filteredGraph.setNode(node, graph.node(node));
      });

      graph.edges().forEach((edge) => {
        if (nodesToInclude.has(edge.v) && nodesToInclude.has(edge.w)) {
          filteredGraph.setEdge(edge.v, edge.w, graph.edge(edge.v, edge.w));
        }
      });

      const filteredDotString = dot.write(filteredGraph);
      setDotString(filteredDotString); // Update the dotString state
    },
    [graph]
  );

  // Parse the DOT string into a graph object when dotString or initialDotString changes
  useEffect(() => {
    if (initialDotString !== dotString) {
      setDotString(initialDotString);
    }
  }, [initialDotString]);

  useEffect(() => {
    if (dotString) {
      try {
        const g = dot.read(dotString);
        console.log("Parsed graph in PolicyTopology:", g);
        console.log("Graph nodes in PolicyTopology:", g.nodes());
        setGraph(g);
      } catch (error) {
        console.error("Error parsing DOT string in PolicyTopology:", error);
      }
    } else {
      console.warn("Empty dotString received in PolicyTopology");
    }
  }, [dotString]);

  // Render the graph with updates using d3-graphviz
  useEffect(() => {
    if (containerRef.current && dotString) {
      try {
        console.log("Rendering dotString with d3-graphviz:", dotString);
  
        // Calculate dimensions dynamically based on viewport
        const viewportWidth = window.innerWidth * 1.2; // Use 95% of the viewport width
        const viewportHeight = window.innerHeight * 0.85; // Use 85% of the viewport height
  
        const graphvizInstance = d3
          .select(containerRef.current)
          .graphviz()
          .width(viewportWidth) // Set width to fill most of the viewport
          .height(viewportHeight) // Set height to fill most of the viewport
          .fit(true) // Ensure it scales proportionally
          .zoom(false); // Disable zoom for now
  
        // Render the graph with animation
        graphvizInstance
          .transition(() => d3.transition().duration(750)) // Animation duration
          .renderDot(dotString)
          .on("end", () => {
            console.log("Graph rendered successfully");
            // Add click event listeners to nodes
            const nodes = containerRef.current.querySelectorAll("g.node");
            nodes.forEach((node) => {
              node.addEventListener("click", (event) => {
                const nodeElement = event.target.closest("g.node");
                const nodeId = nodeElement.querySelector("title").textContent;
                handleNodeSelection(nodeId);
              });
            });
          });
      } catch (error) {
        console.error("Error rendering dotString with d3-graphviz:", error);
      }
    } else if (!dotString) {
      console.warn("No dotString available for rendering");
    }
  }, [dotString, handleNodeSelection]);
  

  // Function to reset the graph to its initial state
  const resetGraph = useCallback(() => {
    setDotString(initialDotString); // Reset the dotString state
  }, [initialDotString]);

  return (
    <div>
      <div className="policy-topology-container" ref={containerRef} />
      <Button
        variant="primary"
        onClick={resetGraph}
        style={{ marginTop: "10px" }}
      >
        Reset Graph
      </Button>
    </div>
  );
};

export default PolicyTopology;
