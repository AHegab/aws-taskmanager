// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetails';
import CreateTask from './pages/CreateTask';
import Login from './pages/login';

function App() {
  useEffect(() => {
    // On app load you could verify or refresh your tokens here
    const token = Cookies.get('idToken');
    if (token) {
      // e.g. check expiry, refresh, etc.
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"      element={<Home />} />

          {/* Protected */}
          <Route path="/tasks"        element={<Tasks />} />
          <Route path="/tasks/:id"    element={<TaskDetail />} />
          <Route path="/create-task"  element={<CreateTask />} />

          {/* Fallback: you could add a 404 page here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
