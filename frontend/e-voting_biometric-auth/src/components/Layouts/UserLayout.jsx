import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Container,
  Row,
  Col,
  Nav,
  Button,
  Card,
  Badge,
  Navbar
} from 'react-bootstrap';
import {
  HouseDoor,
  Person,
  BoxArrowRight,
  CalendarEvent,
  BarChart,
  Fingerprint
} from 'react-bootstrap-icons';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/user/dashboard',
      label: 'Dashboard',
      icon: <HouseDoor size={20} />
    },
    {
      path: '/user/profile',
      label: 'My Profile',
      icon: <Person size={20} />
    }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation Bar */}
      <Navbar expand="lg" className="navbar-dark bg-success shadow-sm">
        <Container fluid>
          <Link className="navbar-brand d-flex align-items-center" to="/user/dashboard">
            <Fingerprint className="me-2" size={28} />
            <span className="fw-bold">E-Voting Portal</span>
          </Link>

          <Navbar.Toggle aria-controls="userNavbar" />
          <Navbar.Collapse id="userNavbar">
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <button
                  className="btn btn-link nav-link dropdown-toggle text-white d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                >
                  <Person className="me-2" size={20} />
                  {user?.f_name} {user?.l_name}
                  <Badge bg="light" className="ms-2 text-success">Voter</Badge>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><h6 className="dropdown-header">{user?.email}</h6></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/user/profile">
                      <Person className="me-2" size={16} />
                      Profile Settings
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <BoxArrowRight className="me-2" size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="p-0">
        <Row className="g-0">
          {/* Sidebar */}
          <Col md={3} lg={2} className="bg-white border-end">
            <Nav className="flex-column p-3 pt-4">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Nav.Item key={item.path} className="mb-2">
                    <Nav.Link
                      as={Link}
                      to={item.path}
                      className={`d-flex align-items-center px-3 py-2 rounded ${
                        isActive
                          ? 'bg-success text-white'
                          : 'text-dark hover-bg-light'
                      }`}
                    >
                      <span className="me-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>

            {/* User Status Card */}
            <Card className="mx-3 mb-3">
              <Card.Header className="bg-light">
                <small className="text-muted">Account Status</small>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small className="text-success">Account Active</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className={user?.has_fingerprint ? "bg-success rounded-circle me-2" : "bg-warning rounded-circle me-2"} style={{ width: '8px', height: '8px' }}></div>
                  <small className={user?.has_fingerprint ? "text-success" : "text-warning"}>
                    Biometric {user?.has_fingerprint ? 'Registered' : 'Not Registered'}
                  </small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-info rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small className="text-info">Ready to Vote</small>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card className="mx-3 mb-3">
              <Card.Header className="bg-light">
                <small className="text-muted">Quick Actions</small>
              </Card.Header>
              <Card.Body className="p-3">
                <Button
                  variant="outline-success"
                  size="sm"
                  className="w-100 mb-2"
                  as={Link}
                 ="/scanner-demo"
                >
                  <Fingerprint className="me-2" size={16} />
                  Test Scanner
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="w-100"
                  as={Link}
                 ="/user/profile"
                >
                  <Person className="me-2" size={16} />
                  Update Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10} className="p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserLayout;