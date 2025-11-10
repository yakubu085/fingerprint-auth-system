import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Container,
  Row,
  Col,
  Nav,
  Button,
  Card,
  Badge
} from 'react-bootstrap';
import {
  HouseDoor,
  CalendarEvent,
  People,
  GraphUp,
  BoxArrowRight,
  PersonGear,
  ShieldCheck
} from 'react-bootstrap-icons';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: <HouseDoor size={20} />
    },
    {
      path: '/admin/elections',
      label: 'Elections',
      icon: <CalendarEvent size={20} />
    },
    {
      path: '/admin/candidates',
      label: 'Candidates',
      icon: <People size={20} />
    },
    {
      path: '/admin/results',
      label: 'Results & Analytics',
      icon: <GraphUp size={20} />
    }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <Container fluid>
          <Link className="navbar-brand d-flex align-items-center" to="/admin/dashboard">
            <ShieldCheck className="me-2" size={28} />
            <span className="fw-bold">Admin Panel</span>
          </Link>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="btn btn-link nav-link dropdown-toggle text-white d-flex align-items-center"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
              >
                <PersonGear className="me-2" size={20} />
                {user?.f_name} {user?.l_name}
                <Badge bg="danger" className="ms-2">Admin</Badge>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><h6 className="dropdown-header">{user?.email}</h6></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/user/profile">
                    <PersonGear className="me-2" size={16} />
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
        </Container>
      </nav>

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
                          ? 'bg-primary text-white'
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

            {/* Quick Stats Card */}
            <Card className="mx-3 mb-3">
              <Card.Header className="bg-light">
                <small className="text-muted">System Status</small>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small className="text-success">System Online</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-warning rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small className="text-warning">Scanner Active</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-info rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small className="text-info">Database Connected</small>
                </div>
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

export default AdminLayout;