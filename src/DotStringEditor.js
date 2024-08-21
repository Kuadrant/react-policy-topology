import React, { useState, useEffect, useRef } from 'react';
import { TextArea } from '@patternfly/react-core';

const DotStringEditor = ({ dotString, onDotStringChange }) => {
  const [localDotString, setLocalDotString] = useState(dotString);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalDotString(dotString);
  }, [dotString]);

  const handleChange = (value) => {
    setLocalDotString(value);

    // Clear the existing timeout if there is one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to trigger the update after 1 second of inactivity
    timeoutRef.current = setTimeout(() => {
      onDotStringChange(value);
    }, 1000); // 1 second delay
  };

  // Clear the timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="dot-string-editor">
      <h3>Edit DOT String</h3>
      <TextArea
        value={localDotString}
        onChange={handleChange}
        aria-label="DOT string editor"
        rows={15}
        resizeOrientation="vertical"
      />
    </div>
  );
};

export default DotStringEditor;
