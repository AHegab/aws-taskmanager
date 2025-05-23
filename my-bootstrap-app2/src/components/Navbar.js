import React from 'react';
import { Navbar as BSNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Navbar() {
  const isAuthenticated = !!Cookies.get('idToken');

  const handleLogout = () => {
    Cookies.remove('idToken');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    window.location.href = '/';
  };

  return (
    <BSNavbar bg="light" expand="lg">
      <Container>
        <BSNavbar.Brand as={Link} to="/">TaskManager</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="nav" />
        <BSNavbar.Collapse id="nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
            {isAuthenticated && <Nav.Link as={Link} to="/create-task">Create Task</Nav.Link>}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {/* <Nav.Link as={Link} to="/profile">Profile</Nav.Link> */}
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
<Nav.Link
  as="a"
  href={
    `https://eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com/login?` +
    `client_id=6thkk9j96oa02djeccritml1gr&` +
    `response_type=code&` +
    `scope=email+openid+profile&` +
    `redirect_uri=${encodeURIComponent('https://d1m0uvthvhxhiw.cloudfront.net/callback')}`
  }
>
  Login
</Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}