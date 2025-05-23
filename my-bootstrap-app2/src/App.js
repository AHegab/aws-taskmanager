import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateTask from './pages/CreateTask';
import Home from './pages/Home';
import TaskDetail from './pages/TaskDetails';
import Tasks from './pages/Tasks';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import Callback from './pages/Callback'; // your existing Callback
import LoginErrorPage from './pages/LoginErrorPage';

function App() {
  useEffect(() => {
    // if we got redirected here with tokens in the URL, persist them
    const params = new URLSearchParams(window.location.search);
    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (idToken && accessToken) {
      // set your cookies exactly as you would in Callback
      Cookies.set('idToken', idToken, {
        expires: 1,
        secure: false,      // set to true in prod HTTPS
        sameSite: 'lax'
      });
      Cookies.set('accessToken', accessToken, {
        expires: 1,
        secure: false,
        sameSite: 'lax'
      });
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, {
          expires: 30,
          secure: false,
          sameSite: 'lax'
        });
      }

      // remove the tokens from the URL
      window.history.replaceState({}, '', window.location.pathname);
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
