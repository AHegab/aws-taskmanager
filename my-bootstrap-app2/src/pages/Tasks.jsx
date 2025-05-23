import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Spinner, Alert, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Tasks() {
  const [tasks,  setTasks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

 const fetchTasks = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const resp = await api.get('/tasks');
    console.log('raw tasks payload:', resp.data);

    let payload = resp.data;
    if (payload && typeof payload.statusCode === 'number') {
      if (payload.statusCode !== 200) {
        const errBody = JSON.parse(payload.body || '{}');
        throw new Error(errBody.error || 'Failed to load tasks');
      }
      payload = JSON.parse(payload.body);
    }

    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.tasks)
        ? payload.tasks
        : [];

    setTasks(list);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    
    if (err.code === 'ERR_NETWORK') {
      setError('Network error - please check your connection');
    } else if (err.response?.status === 401) {
      setError('Session expired - please login again');
      // Clear invalid token
      localStorage.removeItem('idToken');
      document.cookie = 'idToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else {
      setError(err.message || 'Failed to load tasks');
    }
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Error loading tasks<br />
          {error}{' '}
          <Button variant="outline-danger" size="sm" onClick={fetchTasks}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Your Tasks</h2>
      {tasks.length === 0 ? (
        <p>
          No tasks found.&nbsp;<Link to="/create-task">Create one now</Link>
        </p>
      ) : (
        <div className="row">
          {tasks.map((task) => (
            <div key={task.taskId} className="col-md-4 mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{task.title}</Card.Title>
                  {task.description && (
                    <Card.Text>{task.description}</Card.Text>
                  )}
                  <Card.Text>
                    <small>Status: {task.status}</small>
                  </Card.Text>
                  <Button
                    as={Link}
                    to={`/tasks/${task.taskId}`}
                    variant="primary"
                  >
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}