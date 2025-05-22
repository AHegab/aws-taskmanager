// src/pages/TaskDetail.jsx

import React, { useEffect, useState } from 'react'
import {
  Container,
  Spinner,
  Alert,
  Button,
  Form,
  Row,
  Col,
  ListGroup
} from 'react-bootstrap'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [initialTask, setInitialTask] = useState(null) // Track initial state for diffing

  // Load the task on mount
  useEffect(() => {
    ;(async () => {
      try {
        const resp = await api.get(`/tasks/${id}`)
        let data = resp.data

        // unwrap our proxy integration envelope if needed
        if (data && typeof data.body === 'string') {
          data = JSON.parse(data.body)
        } else if (data.task) {
          data = data.task
        }

        // pull out created/updated timestamps from activity_log
        if (data.metadata?.activity_log) {
          const logs = data.metadata.activity_log
          const findTime = label => {
            const match = logs.find(l => l.startsWith(label + ' at '))
            return match ? match.split(' at ')[1] : null
          }
          data.created_at = findTime('Created')
          data.updated_at = findTime('Updated')
        }

        setTask(data)
        setInitialTask(data) // Store initial state
      } catch (err) {
        console.error('Load error:', err)
        setError(err.message || 'Failed to load task')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // Helper to get changed fields only
  const getChangedFields = () => {
    if (!initialTask || !task) return {}
    
    const changes = {}
    
    // Check each field for changes
    if (task.title !== initialTask.title) changes.title = task.title
    if (task.description !== initialTask.description) changes.description = task.description
    if (task.status !== initialTask.status) changes.status = task.status
    
    return changes
  }

  // Updated handleSave function
const handleSave = async () => {
  setSaving(true);
  setError(null);

  try {
    // Determine what changed
    const updates = {};
    if (task.title !== initialTask.title) updates.title = task.title;
    if (task.description !== initialTask.description) updates.description = task.description;
    if (task.status !== initialTask.status) updates.status = task.status;

    // If no field changes but we have files, send empty updates to trigger attachment processing
    if (selectedFiles.length > 0 && Object.keys(updates).length === 0) {
      updates.attachments = task.attachments || [];
    }

    // If absolutely nothing changed
    if (selectedFiles.length === 0 && Object.keys(updates).length === 0) {
      setError('No changes detected');
      return;
    }

    // SIMPLE JSON APPROACH (like your test)
    if (selectedFiles.length === 0) {
      const response = await api.put(`/tasks/${id}`, updates, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      navigate('/tasks');
      return;
    }

    // MULTIPART APPROACH (when files are included)
    const formData = new FormData();
    formData.append('data', JSON.stringify(updates));
    selectedFiles.forEach(f => formData.append('attachments', f));

    await api.put(`/tasks/${id}`, formData);
    navigate('/tasks');
  } catch (err) {
    console.error('Save error:', err.response || err);
    let msg = 'Failed to save changes';
    const d = err.response?.data;
    if (d) {
      if (typeof d === 'string') msg = d;
      else if (d.error) msg = d.error;
      else if (d.message) msg = d.message;
      else msg = JSON.stringify(d);
    } else if (err.message) {
      msg = err.message;
    }
    setError(msg);
  } finally {
    setSaving(false);
  }
};
  // Delete the task
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    setDeleting(true)
    setError(null)

    try {
      await api.delete(`/tasks/${id}`)
      navigate('/tasks')
    } catch (err) {
      console.error('Delete error:', err.response || err)
      let msg = 'Failed to delete task'
      const d = err.response?.data
      if (d) {
        if (typeof d === 'string') msg = d
        else if (d.error) msg = d.error
        else if (d.message) msg = d.message
        else msg = JSON.stringify(d)
      } else if (err.message) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setDeleting(false)
    }
  }

  // Render states
  if (loading) return <Container className="mt-4"><Spinner animation="border" /></Container>
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>
  if (!task) return <Container className="mt-4"><Alert variant="warning">Task not found</Alert></Container>

  return (
    <Container className="mt-4">
      <h2>Task Details</h2>
      <Form>
        {/* Title */}
        <Form.Group as={Row} className="mb-3" controlId="taskTitle">
          <Form.Label column sm={2}>Title</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              value={task.title||''}
              onChange={e => setTask({ ...task, title: e.target.value })}
            />
          </Col>
        </Form.Group>

        {/* Description */}
        <Form.Group className="mb-3" controlId="taskDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={task.description||''}
            onChange={e => setTask({ ...task, description: e.target.value })}
          />
        </Form.Group>

        {/* Status */}
        <Form.Group as={Row} className="mb-3" controlId="taskStatus">
          <Form.Label column sm={2}>Status</Form.Label>
          <Col sm={10}>
            <Form.Select
              value={task.status||'Pending'}
              onChange={e => setTask({ ...task, status: e.target.value })}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </Form.Select>
          </Col>
        </Form.Group>

        {/* Created / Last Updated */}
        <ListGroup className="mb-3">
          <ListGroup.Item>
            <strong>Created:</strong>{' '}
            {task.created_at ? new Date(task.created_at).toLocaleString() : '—'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Last Updated:</strong>{' '}
            {task.updated_at ? new Date(task.updated_at).toLocaleString() : '—'}
          </ListGroup.Item>
        </ListGroup>

        {/* Existing Attachments */}
        <h5>Attachments</h5>
        {task.attachments?.length
          ? <ListGroup className="mb-3">
              {task.attachments.map((url,i) => (
                <ListGroup.Item key={i}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {url.split('/').pop()}
                  </a>
                </ListGroup.Item>
              ))}
            </ListGroup>
          : <p className="text-muted">No attachments yet.</p>
        }

        {/* Upload New Attachments */}
        <Form.Group controlId="taskFiles" className="mb-4">
          <Form.Label>Upload Attachments</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={e => setSelectedFiles(Array.from(e.target.files))}
          />
        </Form.Group>

        {/* Action Buttons */}
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </Col>
          <Col className="text-end">
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete Task'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  )
}