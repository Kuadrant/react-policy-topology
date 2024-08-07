import React, { useEffect, useRef, useCallback, useState } from "react";
import { instance } from "@viz-js/viz";
import graphlib from "graphlib";
import * as dot from "graphlib-dot";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Title,
} from "@patternfly/react-core";

const PolicyTopology = ({ dotString }) => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [filteredDot, setFilteredDot] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    const g = dot.read(dotString);
    graphRef.current = g;
    setFilteredDot(dotString);

    // Populate the dropdown with nodes from the graph
    const items = [
      <DropdownItem
        key="reset"
        component="button"
        onClick={() => handleNodeSelection(null)}
      >
        -
      </DropdownItem>,
      ...g.nodes().map((node) => (
        <DropdownItem
          key={node}
          component="button"
          onClick={() => handleNodeSelection(node)}
        >
          {g.node(node).label}
        </DropdownItem>
      )),
    ];
    setDropdownItems(items);
  }, [dotString]);

  const handleNodeSelection = useCallback(
    (nodeId) => {
      const graph = graphRef.current;
      if (!graph) {
        console.error("Graph is not initialized");
        return;
      }

      if (nodeId === null) {
        // Reset to show the entire graph
        setSelectedLabel("Select a resource");
        setFilteredDot(dotString);
        return;
      }

      const selectedNodeLabel = graph.node(nodeId).label;
      setSelectedLabel(selectedNodeLabel);

      const filteredGraph = new graphlib.Graph();
      const nodesToInclude = new Set();

      // Helper function to add predecessors of a node to the set
      const addPredecessors = (node) => {
        if (!nodesToInclude.has(node)) {
          nodesToInclude.add(node);
          const predecessors = graph.predecessors(node) || [];
          predecessors.forEach(addPredecessors);
        }
      };

      // Helper function to add successors of a node to the set
      const addSuccessors = (node) => {
        const successors = graph.successors(node) || [];
        successors.forEach((successor) => {
          nodesToInclude.add(successor);
        });
      };

      // Include the selected node and its predecessors and successors
      addPredecessors(nodeId);
      addSuccessors(nodeId);

      // Add the nodes and edges to the filtered graph
      nodesToInclude.forEach((node) => {
        filteredGraph.setNode(node, graph.node(node));
      });

      graph.edges().forEach((edge) => {
        if (nodesToInclude.has(edge.v) && nodesToInclude.has(edge.w)) {
          filteredGraph.setEdge(edge.v, edge.w, graph.edge(edge.v, edge.w));
        }
      });

      // Convert the filtered graph back to a DOT string
      const filteredDotString = dot.write(filteredGraph);
      setFilteredDot(filteredDotString);
    },
    [dotString]
  );

  const onToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  useEffect(() => {
    if (containerRef.current && filteredDot) {
      // Render the graph as an SVG element and append it to the container
      instance()
        .then((viz) => {
          return viz.renderSVGElement(filteredDot);
        })
        .then((svgElement) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(svgElement);
          }
        })
        .catch((error) => {
          console.error("Error rendering DOT file:", error);
        });
    }
  }, [filteredDot]);

  return (
    <div className="policy-topology">
      <Title headingLevel="h2" size="lg" className="pf-m-lg">
        Pick a resource to filter by
      </Title>
      <Dropdown
        onSelect={() => setIsDropdownOpen(false)}
        toggle={
          <DropdownToggle onToggle={onToggle}>
            {selectedLabel || "Select a resource"}
          </DropdownToggle>
        }
        isOpen={isDropdownOpen}
        dropdownItems={dropdownItems}
      />
      <div ref={containerRef} className="policy-topology-container" />
    </div>
  );
};

export default PolicyTopology;
