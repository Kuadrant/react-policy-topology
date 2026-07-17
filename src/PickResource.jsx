import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from "@patternfly/react-core";

const PickResource = ({ graph, onResourceSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Select a resource");

  const handleSelection = (nodeId) => {
    if (graph && typeof graph.node === "function") {
      setSelectedLabel(
        nodeId ? graph.node(nodeId).label : "Select a resource"
      );
    }
    onResourceSelect(nodeId);
    setIsDropdownOpen(false);
  };

  const hasNodes = graph && typeof graph.nodes === "function";

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          isExpanded={isDropdownOpen}
        >
          {selectedLabel}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem key="reset" onClick={() => handleSelection(null)}>
          -
        </DropdownItem>
        {hasNodes &&
          graph.nodes().map((node) => (
            <DropdownItem key={node} onClick={() => handleSelection(node)}>
              {graph.node(node)?.label || node}
            </DropdownItem>
          ))}
      </DropdownList>
    </Dropdown>
  );
};

export default PickResource;
