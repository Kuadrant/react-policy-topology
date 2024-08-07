import React, { useEffect, useRef } from 'react';
import { instance } from '@viz-js/viz';

const PolicyTopology = ({ dot }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    console.log("Rendering PolicyTopology with dot:", dot);
    if (containerRef.current && dot) {
      instance().then(viz => {
        return viz.renderSVGElement(dot);
      }).then(svgElement => {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(svgElement);
      }).catch(error => {
        console.error('Error rendering DOT file:', error);
      });
    }
  }, [dot]);

  return (
    <div ref={containerRef} className="policy-topology-container" />
  );
};

export default PolicyTopology;
