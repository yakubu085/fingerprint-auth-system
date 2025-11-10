import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  BarChart,
  People,
  Clock,
  CheckCircle,
  PlusCircle,
  ListCheck,
  Eye,
  Activity,
  ExclamationTriangle
} from 'react-bootstrap-icons';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalElections: createLoadingState(),
    activeVoters: createLoadingState(),
    recentVotes: createLoadingState(),
    systemHealth: createLoadingState()
  });

  const [recentActivity, setRecentActivity] = useState(createLoadingState());

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({
        ...prev,
        totalElections: setLoading(prev.totalElections),
        activeVoters: setLoading(prev.activeVoters),
        recentVotes: setLoading(prev.recentVotes)
      }));

      // Fetch elections data
      const electionsResponse = await api.elections.getAll();
      const elections = electionsResponse.data || [];

      // Fetch voting results for statistics
      const totalVotes = await Promise.all(
        elections.map(async (election) => {
          try {
            const result = await api.voting.getResults(election.id);
            return result.data?.totalVotes || 0;
          } catch {
            return 0;
          }
        })
      );

      const totalVoteCount = totalVotes.reduce((sum, votes) => sum + votes, 0);

      setStats(prev => ({
        ...prev,
        totalElections: setData(prev.totalElections, elections.length),
        activeVoters: setData(prev.activeVoters, 1250), // Mock data for demo
        recentVotes: setData(prev.recentVotes, totalVoteCount),
        systemHealth: setData(prev.systemHealth, 'All Systems Operational')
      }));
    } catch (error) {
      setStats(prev => ({
        totalElections: setError(prev.totalElections, error.message),
        activeVoters: setError(prev.activeVoters, error.message),
        recentVotes: setError(prev.recentVotes, error.message),
        systemHealth: setError(prev.systemHealth, 'System Error')
      }));
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setRecentActivity(setLoading(recentActivity));

      // Mock recent activity data
      const mockActivity = [
        {
          id: 1,
          type: 'vote_cast',
          user: 'John Doe',
          election: 'Student Council Election 2025',
          timestamp: '2 minutes ago',
          status: 'success'
        },
        {
          id: 2,
          type: 'user_registered',
          user: 'Jane Smith',
          election: null,
          timestamp: '5 minutes ago',
          status: 'success'
        },
        {
          id: 3,
          type: 'election_created',
          user: 'Admin',
          election: 'Department Head Election',
          timestamp: '10 minutes ago',
          status: 'success'
        },
        {
          id: 4,
          type: 'vote_cast',
          user: 'Mike Johnson',
          election: 'Student Council Election 2025',
          timestamp: '15 minutes ago',
          status: 'success'
        },
        {
          id: 5,
          type: 'login_attempt',
          user: 'Unknown User',
          election: null,
          timestamp: '20 minutes ago',
          status: 'failed'
        }
      ];

      setRecentActivity(setData(recentActivity, mockActivity));
    } catch (error) {
      setRecentActivity(setError(recentActivity, error.message));
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'vote_cast': return <CheckCircle className="text-success" size={16} />;
      case 'user_registered': return <People className="text-primary" size={16} />;
      case 'election_created': return <PlusCircle className="text-info" size={16} />;
      case 'login_attempt': return <ExclamationTriangle className="text-warning" size={16} />;
      default: return <Activity className="text-secondary" size={16} />;
    }
  };

  const getActivityBadgeVariant = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const StatCard = ({ title, value, icon, variant, loading, error }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted mb-2">{title}</p>
            <h3 className="mb-0">
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : error ? (
                <span className="text-danger">Error</span>
              ) : (
                value
              )}
            </h3>
          </div>
          <div className={`text-${variant} bg-${variant} bg-opacity-10 rounded-circle p-3`}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Admin Dashboard</h1>
              <p className="text-muted mb-0">System overview and quick actions</p>
            </div>
            <div>
              <Badge bg="success" className="me-2">
                <Activity className="me-1" size={12} />
                System Online
              </Badge>
              <span className="text-muted">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* System Health Alert */}
      {stats.systemHealth.error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" className="d-flex align-items-center">
              <ExclamationTriangle className="me-2" size={20} />
              <div>
                <strong>System Alert:</strong> {stats.systemHealth.error}
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            title="Total Elections"
            value={stats.totalElections.data || 0}
            icon={<BarChart size={24} />}
            variant="primary"
            loading={stats.totalElections.isLoading}
            error={stats.totalElections.error}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            title="Active Voters"
            value={stats.activeVoters.data?.toLocaleString() || '0'}
            icon={<People size={24} />}
            variant="success"
            loading={stats.activeVoters.isLoading}
            error={stats.activeVoters.error}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            title="Recent Votes"
            value={stats.recentVotes.data?.toLocaleString() || '0'}
            icon={<CheckCircle size={24} />}
            variant="info"
            loading={stats.recentVotes.isLoading}
            error={stats.recentVotes.error}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            title="System Health"
            value={stats.systemHealth.data || 'Checking...'}
            icon={<Activity size={24} />}
            variant="warning"
            loading={stats.systemHealth.isLoading}
            error={stats.systemHealth.error}
          />
        </Col>
      </Row>

      {/* Quick Actions and Recent Activity */}
      <Row className="g-4">
        {/* Quick Actions */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Card className="border bg-light">
                    <Card.Body className="text-center p-4">
                      <PlusCircle className="text-primary mb-3" size={32} />
                      <Card.Title className="h6 mb-2">Create Election</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        Start a new election with candidates
                      </Card.Text>
                      <Button
                        variant="primary"
                        as={Link}
                        to="/admin/elections"
                        className="w-100"
                      >
                        Create Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border bg-light">
                    <Card.Body className="text-center p-4">
                      <ListCheck className="text-success mb-3" size={32} />
                      <Card.Title className="h6 mb-2">Manage Candidates</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        Add or remove candidates from elections
                      </Card.Text>
                      <Button
                        variant="success"
                        as={Link}
                        to="/admin/candidates"
                        className="w-100"
                      >
                        Manage Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border bg-light">
                    <Card.Body className="text-center p-4">
                      <Eye className="text-info mb-3" size={32} />
                      <Card.Title className="h6 mb-2">View Results</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        Monitor election results and analytics
                      </Card.Text>
                      <Button
                        variant="info"
                        as={Link}
                        to="/admin/results"
                        className="w-100"
                      >
                        View Results
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border bg-light">
                    <Card.Body className="text-center p-4">
                      <Activity className="text-warning mb-3" size={32} />
                      <Card.Title className="h6 mb-2">System Monitor</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        View system performance and logs
                      </Card.Text>
                      <Button
                        variant="warning"
                        href="#activity"
                        className="w-100"
                      >
                        View Activity
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100" id="activity">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {recentActivity.isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <p className="text-muted mt-2">Loading activity...</p>
                </div>
              ) : recentActivity.error ? (
                <Alert variant="danger" className="small">
                  Error loading activity: {recentActivity.error}
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {recentActivity.data?.map((activity) => (
                    <ListGroup.Item key={activity.id} className="px-0 border-bottom">
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small">
                            <strong>{activity.user}</strong>
                            {activity.election && (
                              <span> in <em>{activity.election}</em></span>
                            )}
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <Badge
                              bg={getActivityBadgeVariant(activity.status)}
                              className="small"
                            >
                              {activity.type.replace('_', ' ')}
                            </Badge>
                            <small className="text-muted">
                              {activity.timestamp}
                            </small>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;