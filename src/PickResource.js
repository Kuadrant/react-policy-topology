import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownToggle, DropdownItem } from '@patternfly/react-core';

const PickResource = ({ graph, onResourceSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('Select a resource');

  useEffect(() => {
    if (graph) {
      const items = [
        <DropdownItem key="reset" component="button" onClick={() => handleSelection(null)}>
          -
        </DropdownItem>,
        ...graph.nodes().map(node => (
          <DropdownItem key={node} component="button" onClick={() => handleSelection(node)}>
            {graph.node(node).label}
          </DropdownItem>
        )),
      ];
      setDropdownItems(items);
    }
  }, [graph]);

  const handleSelection = (nodeId) => {
    setSelectedLabel(nodeId ? graph.node(nodeId).label : 'Select a resource');
    onResourceSelect(nodeId);
    setIsDropdownOpen(false);
  };

  const onToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  return (
    <Dropdown
      onSelect={() => setIsDropdownOpen(false)}
      toggle={<DropdownToggle onToggle={onToggle}>{selectedLabel}</DropdownToggle>}
      isOpen={isDropdownOpen}
      dropdownItems={dropdownItems}
    />
  );
};

export default PickResource;
