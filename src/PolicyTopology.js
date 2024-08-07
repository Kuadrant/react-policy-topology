import React, { useState, useEffect, useRef, useCallback } from 'react';
import graphlib from 'graphlib';
import * as dot from 'graphlib-dot';
import { Dropdown, DropdownToggle, DropdownItem, Title } from '@patternfly/react-core';
import { instance } from '@viz-js/viz';
import './PolicyTopology.css';

const PolicyTopology = ({ dotString }) => {
  const graphRef = useRef(null); // useRef to hold the graph reference
  const [filteredDot, setFilteredDot] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(''); // hold the selected label
  const containerRef = useRef(null);

  const handleNodeSelection = useCallback((nodeId) => {
    console.log("Node selected:", nodeId);

    const graph = graphRef.current; // Use the graph reference
    if (!graph) {
      console.error('Graph is not initialized');
      return;
    }
    console.log("Current graph state:", graph);

    if (nodeId === null) {
      // Reset filtering
      setSelectedLabel('Select a resource');
      setFilteredDot(dotString);
      return;
    }

    const selectedNodeLabel = graph.node(nodeId).label;
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
    console.log('Filtered DOT string:', filteredDotString);
    setFilteredDot(filteredDotString);
  }, [dotString, setSelectedLabel, setFilteredDot]);

  useEffect(() => {
    const g = dot.read(dotString);
    console.log('Graph initialized:', g);
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

  const onToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  useEffect(() => {
    if (containerRef.current && filteredDot) {
      instance().then(viz => {
        return viz.renderSVGElement(filteredDot);
      }).then(svgElement => {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(svgElement);
      }).catch(error => {
        console.error('Error rendering DOT file:', error);
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
        toggle={<DropdownToggle onToggle={onToggle}>{selectedLabel || 'Select a resource'}</DropdownToggle>}
        isOpen={isDropdownOpen}
        dropdownItems={dropdownItems}
      />
      <div ref={containerRef} className="policy-topology-container" />
    </div>
  );
};

export default PolicyTopology;
