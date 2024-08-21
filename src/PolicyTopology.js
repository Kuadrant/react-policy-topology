import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { graphviz } from 'd3-graphviz'; // eslint-disable-line no-unused-vars
import graphlib from 'graphlib';
import * as dot from 'graphlib-dot';
import { Dropdown, DropdownToggle, DropdownItem, Title, Button } from '@patternfly/react-core';
import './PolicyTopology.css';

const PolicyTopology = ({ dotString }) => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [filteredDot, setFilteredDot] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');

  const handleNodeSelection = useCallback((nodeId) => {
    const graph = graphRef.current;
    if (!graph) {
      console.error('Graph is not initialized');
      return;
    }

    if (nodeId === null) {
      setSelectedLabel('Select a resource');
      setFilteredDot(dotString);
      return;
    }

    const selectedNode = graph.node(nodeId);
    if (!selectedNode) {
      console.error(`Selected node not found in graph. nodeId: ${nodeId}`);
      return;
    }

    const selectedNodeLabel = selectedNode.label;
    setSelectedLabel(selectedNodeLabel);

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
    setFilteredDot(filteredDotString);
  }, [dotString]);

  useEffect(() => {
    const g = dot.read(dotString);
    graphRef.current = g;
    setFilteredDot(dotString);

    const items = [
      <DropdownItem key="reset" component="button" onClick={() => handleNodeSelection(null)}>
        -
      </DropdownItem>,
      ...g.nodes().map(node => (
        <DropdownItem key={node} component="button" onClick={() => handleNodeSelection(node)}>
          {g.node(node).label}
        </DropdownItem>
      )),
    ];
    setDropdownItems(items);
  }, [dotString, handleNodeSelection]);

  const handleNodeClick = useCallback((event) => {
    const nodeElement = event.target.closest('g.node');
    if (!nodeElement) {
      console.error('No node element found');
      return;
    }
    const nodeId = nodeElement.querySelector('title').textContent;
    console.log(`Node clicked: ${nodeId}`);
    handleNodeSelection(nodeId);
  }, [handleNodeSelection]);

  const onToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  const resetGraph = () => {
    setSelectedLabel('Select a resource');
    setFilteredDot(dotString);
  };

  useEffect(() => {
    if (containerRef.current && filteredDot) {
      const renderGraph = () => {
        d3.select(containerRef.current).graphviz()
          .zoom(false)
          .transition(() => d3.transition().duration(750))
          .renderDot(filteredDot)
          .on('end', () => {
            const nodes = containerRef.current.querySelectorAll('g.node');
            nodes.forEach(node => {
              node.addEventListener('click', handleNodeClick);
            });
          });
      };

      renderGraph();
    }
  }, [filteredDot, handleNodeClick]);

  return (
    <div className="policy-topology">
      <Title headingLevel="h3" size="md" className="pf-m-md">
        Pick a resource to filter by
      </Title>
      <div className="dropdown-container">
        <Dropdown
          onSelect={() => setIsDropdownOpen(false)}
          toggle={<DropdownToggle onToggle={onToggle}>{selectedLabel || 'Select a resource'}</DropdownToggle>}
          isOpen={isDropdownOpen}
          dropdownItems={dropdownItems}
        />
        <Button variant="secondary" onClick={resetGraph} style={{ marginLeft: '10px' }}>Reset Graph</Button>
      </div>
      <div ref={containerRef} className="policy-topology-container" />
    </div>
  );
};

export default PolicyTopology;
