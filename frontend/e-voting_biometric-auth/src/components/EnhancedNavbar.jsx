import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Navbar,
  Nav,
  Container,
  Button,
  Dropdown,
  Badge,
  NavDropdown,
  Form
} from 'react-bootstrap';
import {
  Fingerprint,
  ShieldCheck,
  Person,
  BoxArrowRight,
  PersonGear,
  HouseDoor,
  InfoCircle,
  Telephone,
  Envelope,
  Search,
  Bell,
  Moon,
  Sun
} from 'react-bootstrap-icons';

const EnhancedNavbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  // Get appropriate navigation based on user role
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { path: '/', label: 'Home', icon: <HouseDoor size={16} /> },
        { path: '/scanner-demo', label: 'Scanner Demo', icon: <Fingerprint size={16} /> },
        { path: '/#features', label: 'Features', icon: <InfoCircle size={16} /> },
        { path: '/#contact', label: 'Contact', icon: <Telephone size={16} /> }
      ];
    }

    if (user?.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <HouseDoor size={16} /> },
        { path: '/admin/elections', label: 'Elections', icon: <ShieldCheck size={16} /> },
        { path: '/admin/candidates', label: 'Candidates', icon: <Person size={16} /> },
        { path: '/admin/results', label: 'Results', icon: <InfoCircle size={16} /> }
      ];
    }

    return [
      { path: '/user/dashboard', label: 'Dashboard', icon: <HouseDoor size={16} /> },
      { path: '/elections', label: 'Elections', icon: <ShieldCheck size={16} /> },
      { path: '/user/profile', label: 'Profile', icon: <PersonGear size={16} /> }
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className={`shadow-sm transition-all duration-300 ${
          isScrolled
            ? 'bg-white py-2'
            : location.pathname === '/'
            ? 'bg-transparent text-white'
            : 'bg-white'
        }`}
        style={{
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : undefined
        }}
      >
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <Fingerprint
              className={`me-2 ${
                location.pathname === '/' && !isScrolled ? 'text-white' : 'text-primary'
              }`}
              size={28}
            />
            <span
              className={`fw-bold ${
                location.pathname === '/' && !isScrolled ? 'text-white' : 'text-dark'
              }`}
            >
              BioVote
            </span>
          </Navbar.Brand>

          {/* Mobile Toggle */}
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`border-0 ${
              location.pathname === '/' && !isScrolled ? 'text-white' : ''
            }`}
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  className={`d-flex align-items-center ${
                    location.pathname === item.path ? 'active' : ''
                  } ${
                    location.pathname === '/' && !isScrolled ? 'text-white' : 'text-dark'
                  }`}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.label}
                </Nav.Link>
              ))}

              {/* Additional nav items for public pages */}
              {!isAuthenticated && (
                <>
                  <NavDropdown
                    title="Resources"
                    id="resources-dropdown"
                    className={
                      location.pathname === '/' && !isScrolled ? 'text-white' : 'text-dark'
                    }
                  >
                    <NavDropdown.Item as={Link} to="/scanner-demo">
                      <Fingerprint className="me-2" size={16} />
                      Try Scanner Demo
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/#features">
                      <InfoCircle className="me-2" size={16} />
                      Features
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/#security">
                      <ShieldCheck className="me-2" size={16} />
                      Security
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#" disabled>
                      Documentation (Coming Soon)
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}
            </Nav>

            {/* Right side items */}
            <div className="d-flex align-items-center">
              {/* Search Toggle */}
              <Button
                variant="link"
                className={`me-3 p-1 ${
                  location.pathname === '/' && !isScrolled ? 'text-white' : 'text-dark'
                }`}
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={20} />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="link"
                className={`me-3 p-1 ${
                  location.pathname === '/' && !isScrolled ? 'text-white' : 'text-dark'
                }`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              {/* User Authentication */}
              {isLoading ? (
                <div className="spinner-border spinner-border-sm me-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : !isAuthenticated ? (
                <div className="d-flex gap-2">
                  <Button
                    as={Link}
                    to="/login"
                    variant={
                      location.pathname === '/' && !isScrolled ? 'outline-light' : 'outline-primary'
                    }
                    className="px-3"
                  >
                    Login
                  </Button>
                  <Button
                    as={Link}
                    to="/signup"
                    variant={
                      location.pathname === '/' && !isScrolled ? 'light' : 'primary'
                    }
                    className="px-3"
                  >
                    Register
                  </Button>
                </div>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className={`d-flex align-items-center text-decoration-none p-1 ${
                      location.pathname === '/' && !isScrolled ? 'text-white' : 'text-dark'
                    }`}
                    id="user-dropdown"
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Person size={16} />
                      </div>
                      <div className="text-start d-none d-lg-block">
                        <div className="fw-semibold small">
                          {user?.f_name} {user?.l_name}
                        </div>
                        <Badge
                          bg={user?.role === 'admin' ? 'danger' : 'success'}
                          className="text-xs"
                        >
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-sm border-0">
                    <Dropdown.Header className="text-muted small">
                      {user?.email}
                    </Dropdown.Header>
                    <Dropdown.Divider />

                    {/* Profile Link */}
                    <Dropdown.Item as={Link} to="/user/profile">
                      <PersonGear className="me-2" size={16} />
                      Profile Settings
                    </Dropdown.Item>

                    {/* Role-specific links */}
                    {user?.role === 'admin' && (
                      <>
                        <Dropdown.Item as={Link} to="/admin/dashboard">
                          <HouseDoor className="me-2" size={16} />
                          Admin Dashboard
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/admin/elections">
                          <ShieldCheck className="me-2" size={16} />
                          Manage Elections
                        </Dropdown.Item>
                      </>
                    )}

                    {user?.role === 'user' && (
                      <>
                        <Dropdown.Item as={Link} to="/user/dashboard">
                          <HouseDoor className="me-2" size={16} />
                          My Dashboard
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/scanner-demo">
                          <Fingerprint className="me-2" size={16} />
                          Test Scanner
                        </Dropdown.Item>
                      </>
                    )}

                    <Dropdown.Divider />

                    {/* Notifications */}
                    <Dropdown.Item>
                      <Bell className="me-2" size={16} />
                      Notifications
                      <Badge bg="danger" className="ms-auto">2</Badge>
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    {/* Logout */}
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="text-danger"
                    >
                      <BoxArrowRight className="me-2" size={16} />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </Navbar.Collapse>
        </Container>

        {/* Search Bar */}
        {showSearch && (
          <div className="border-top bg-white">
            <Container>
              <Form onSubmit={handleSearch} className="py-3">
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search elections, candidates, or help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 shadow-sm"
                  />
                  <Button variant="primary" type="submit">
                    <Search size={16} />
                  </Button>
                </div>
              </Form>
            </Container>
          </div>
        )}
      </Navbar>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '76px' }}></div>

      {/* Custom styles */}
      <style jsx>{`
        .navbar-brand {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .nav-link {
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          transform: translateY(-1px);
        }

        .nav-link.active {
          font-weight: 600;
        }

        .bg-transparent .nav-link {
          color: rgba(255, 255, 255, 0.85) !important;
        }

        .bg-transparent .nav-link:hover,
        .bg-transparent .nav-link.active {
          color: white !important;
        }

        .dropdown-toggle::after {
          display: none;
        }

        .navbar-toggler {
          border: none;
        }

        .navbar-toggler:focus {
          box-shadow: none;
        }

        .text-xs {
          font-size: 0.75rem;
        }

        /* Custom scrollbar for mobile menu */
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: white;
            border-radius: 0.5rem;
            margin-top: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedNavbar;