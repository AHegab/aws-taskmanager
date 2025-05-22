import React from 'react';
import { getCurrentUser } from '../utils/auth';
import { Container, Alert } from 'react-bootstrap';

export default function ProtectedRoute({ children }) {
  const user = getCurrentUser();

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <h4>401 - Unauthorized</h4>
          <p>You are not authorized to view this page. Please log in first.</p>
        </Alert>
      </Container>
    );
  }

  return children;
}
