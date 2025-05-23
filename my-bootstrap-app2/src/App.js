import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateTask from './pages/CreateTask';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetails';
import Tasks from './pages/Tasks';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import Callback from './pages/Callback'; // You'll need to create this
import LoginErrorPage from './pages/LoginErrorPage'; // You'll need to create this
function App() {
  useEffect(() => {
    // Check for existing session on app load
    const token = Cookies.get('idToken');
    if (token) {
      // You might want to verify token or check expiration here
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/create-task" element={<CreateTask />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/login" element={<LoginErrorPage />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;