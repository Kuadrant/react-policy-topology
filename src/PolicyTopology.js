import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { graphviz } from 'd3-graphviz'; // eslint-disable-line no-unused-vars
import './PolicyTopology.css';

const PolicyTopology = ({ filteredDot, onNodeClick }) => {
  const containerRef = useRef(null);

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
              node.addEventListener('click', (event) => {
                const nodeElement = event.target.closest('g.node');
                const nodeId = nodeElement.querySelector('title').textContent;
                onNodeClick(nodeId);
              });
            });
          });
      };

      renderGraph();
    }
  }, [filteredDot, onNodeClick]);

  return <div ref={containerRef} className="policy-topology-container" />;
};

export default PolicyTopology;
