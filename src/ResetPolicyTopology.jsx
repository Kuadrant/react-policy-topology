import React from 'react';
import { Button } from '@patternfly/react-core';

const ResetPolicyTopology = ({ onReset }) => {
  return (
    <Button variant="secondary" onClick={onReset} style={{ marginLeft: '10px' }}>
      Reset Graph
    </Button>
  );
};

export default ResetPolicyTopology;
