import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import CreateTask from './pages/CreateTask';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetails';
import Tasks from './pages/Tasks';

import ProtectedRoute from './components/ProtectedRoute';


function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      console.log("🔁 Found code in URL:", code);

      fetch("https://xppo00vwz7.execute-api.eu-north-1.amazonaws.com/prod/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Token exchange success:", data);

          if (data.id_token) {
            const decoded = jwtDecode(data.id_token);
            console.log("🧠 Decoded ID Token:", decoded);

            localStorage.setItem("user_id", decoded.sub);
            localStorage.setItem("id_token", data.id_token);

            // Clean up ?code param
            window.history.replaceState({}, "", "/");
          } else {
            console.error("❌ No id_token returned", data);
          }
        })
        .catch((err) => {
          console.error("❌ Token exchange failed", err);
        });
    } else {
      console.log("ℹ️ No ?code param found");
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={
  <ProtectedRoute><Tasks /></ProtectedRoute>
} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/create-task" element={<CreateTask />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
