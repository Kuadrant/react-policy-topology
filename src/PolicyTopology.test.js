import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import PolicyTopology from './PolicyTopology';

// Mock DOT string
const dotString = `
strict digraph "" {
  graph [bb="0,0,440.51,352"];
  node [fillcolor=lightgrey, label="\\N", shape=ellipse];
  "gateway.gateway.networking.k8s.io:default/prod-web" [fillcolor="#e5e5e5", height=0.57778, label="Gateway\\ndefault/prod-web", pos="280.92,253.6", shape=box, style=filled, width=1.5612];
  "gateway.gateway.networking.k8s.io:default/prod-web#http" [fillcolor="#e5e5e5", height=0.57778, label="Listener\\ndefault-prodb-web#http", pos="369.92,176", shape=box, style=filled, width=1.9609];
  "gateway.gateway.networking.k8s.io:default/prod-web" -> "gateway.gateway.networking.k8s.io:default/prod-web#http" [key="Gateway -> Listener", pos="e,346.01,196.85 304.77,232.8 315.05,223.85 327.21,213.24 338.23,203.63"];
}
`;

test('renders PolicyTopology and interacts with dropdown', async () => {
  await act(async () => {
    render(<PolicyTopology dotString={dotString} />);
  });

  // Check if the initial elements are rendered
  expect(screen.getByText(/Pick a resource to filter by/i)).toBeInTheDocument();
  expect(screen.getByText(/Select a resource/i)).toBeInTheDocument();

  // Open the dropdown
  fireEvent.click(screen.getByText(/Select a resource/i));

  // Check if the dropdown items are rendered
  expect(screen.getByText((content) => content.includes('Gateway') && content.includes('default/prod-web'))).toBeInTheDocument();
  expect(screen.getByText((content) => content.includes('Listener') && content.includes('default-prodb-web#http'))).toBeInTheDocument();

  // Click on a dropdown item
  fireEvent.click(screen.getByText((content) => content.includes('Gateway') && content.includes('default/prod-web')));
});
