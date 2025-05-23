import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Updated import

export default function CreateTask() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // Extract user ID from token on component mount
  useEffect(() => {
    const extractUserId = () => {
      try {
        const idToken = Cookies.get('idToken');
        if (!idToken) {
          throw new Error('No authentication token found');
        }

        const decoded = jwtDecode(idToken); // Using jwtDecode instead of jwt_decode
        if (!decoded.sub) {
          throw new Error('User ID not found in token');
        }

        setUserId(decoded.sub);
        setLoadingUser(false);
      } catch (err) {
        console.error('Error extracting user ID:', err);
        setError('Authentication error. Please login again.');
        setLoadingUser(false);
      }
    };

    extractUserId();
  }, []);

  function fileToBase64(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(',')[1]);
      reader.onerror = e => rej(e);
      reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const attachments = await Promise.all(
        files.map(async f => ({
          filename: f.name,
          fileType: f.type,
          data: await fileToBase64(f)
        }))
      );

      const payload = {
        title,
        description,
        dueDate,
        priority,
        userId,
        attachments
      };

      const accessToken = Cookies.get('accessToken');
      const resp = await api.post(
        '/tasks',
        payload,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          } 
        }
      );

      if (resp.status === 201) {
        navigate('/tasks');
      } else {
        throw new Error(resp.data?.error || 'Unexpected response');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading user information...</p>
      </Container>
    );
  }

  if (!userId) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          You must be logged in to create tasks. Please login first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="mx-auto shadow-sm" style={{maxWidth:600}}>
        <Card.Header className="bg-primary text-white">
          <h3>Create New Task</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>Title</Form.Label>
              <Col sm={9}>
                <Form.Control
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea" rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>Priority</Form.Label>
              <Col sm={9}>
                <Form.Select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>Due Date</Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </Col>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Attachments</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={e => setFiles(Array.from(e.target.files))}
              />
              {files.length > 0 && (
                <ul className="mt-2">
                  {files.map((f,i) => <li key={i}>{f.name}</li>)}
                </ul>
              )}
            </Form.Group>

            <div className="text-end">
              <Button disabled={saving} type="submit">
                {saving
                  ? <><Spinner size="sm" animation="border"/> Creating…</>
                  : 'Create Task'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}