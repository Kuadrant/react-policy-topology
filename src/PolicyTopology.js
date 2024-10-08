import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { graphviz } from 'd3-graphviz'; // eslint-disable-line no-unused-vars
import { Button } from '@patternfly/react-core';
import graphlib from 'graphlib';
import * as dot from 'graphlib-dot';
import './PolicyTopology.css';

const PolicyTopology = ({ initialDotString }) => {
  const containerRef = useRef(null);
  const [dotString, setDotString] = useState(initialDotString);
  const [graph, setGraph] = useState(null);

  // Function to update graph when a node is selected
  const handleNodeSelection = useCallback((nodeId) => {
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
      successors.forEach(successor => {
        nodesToInclude.add(successor);
      });
    };

    addPredecessors(nodeId);
    addSuccessors(nodeId);

    nodesToInclude.forEach(node => {
      filteredGraph.setNode(node, graph.node(node));
    });

    graph.edges().forEach(edge => {
      if (nodesToInclude.has(edge.v) && nodesToInclude.has(edge.w)) {
        filteredGraph.setEdge(edge.v, edge.w, graph.edge(edge.v, edge.w));
      }
    });

    const filteredDotString = dot.write(filteredGraph);
    setDotString(filteredDotString); // Update the dotString state
  }, [graph]);

  // Parse the DOT string into a graph object when dotString changes
  useEffect(() => {
    if (dotString) {
      const g = dot.read(dotString);
      setGraph(g);
    }
  }, [dotString]);

  // Render the graph with updates using d3-graphviz
  useEffect(() => {
    if (containerRef.current && graph) {
      const renderGraph = () => {
        d3.select(containerRef.current)
          .graphviz()
          .height(containerRef.current.clientHeight) // Set SVG height to container height
          .fit(true)
          .zoom(false)
          .transition(() => d3.transition().duration(750)) // Animate transitions
          .renderDot(dotString)
          .on('end', () => {
            const nodes = containerRef.current.querySelectorAll('g.node');
            nodes.forEach(node => {
              node.addEventListener('click', (event) => {
                const nodeElement = event.target.closest('g.node');
                const nodeId = nodeElement.querySelector('title').textContent;
                handleNodeSelection(nodeId);
              });
            });
          });
      };

      renderGraph();
    }
  }, [graph, dotString, handleNodeSelection]);

  // Function to reset the graph to its initial state
  const resetGraph = useCallback(() => {
    setDotString(initialDotString); // Reset the dotString state
  }, [initialDotString]);

  return (
    <div>
      <div className="policy-topology-container" ref={containerRef} />
      <Button variant="primary" onClick={resetGraph} style={{ marginTop: '10px' }}>
        Reset Graph
      </Button>
    </div>
  );
};

export default PolicyTopology;
