import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { graphviz } from 'd3-graphviz'; // eslint-disable-line no-unused-vars
import './PolicyTopology.css';

const PolicyTopology = ({ dotString, onNodeClick }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && dotString) {
      const renderGraph = () => {
        d3.select(containerRef.current).graphviz()
          .zoom(false)
          .transition(() => d3.transition().duration(750))
          .renderDot(dotString)
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
  }, [dotString, onNodeClick]);

  return <div ref={containerRef} className="policy-topology-container" />;
};

export default PolicyTopology;
