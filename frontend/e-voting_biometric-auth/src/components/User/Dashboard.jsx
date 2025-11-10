import React, { useState, useEffect, useContext } from 'react';
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
  Spinner,
  Progress
} from 'react-bootstrap';
import {
  Person,
  Clock,
  CheckCircle,
  ExclamationTriangle,
  Fingerprint,
  Settings,
  Calendar,
  Vote,
  Award,
  Activity,
  Eye,
  ArrowRight
} from 'react-bootstrap-icons';
import { AuthContext } from '../../context/AuthContext.jsx';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [availableElections, setAvailableElections] = useState(createLoadingState());
  const [votingHistory, setVotingHistory] = useState(createLoadingState());
  const [fingerprintStatus, setFingerprintStatus] = useState(createLoadingState());

  useEffect(() => {
    fetchAvailableElections();
    fetchVotingHistory();
    fetchFingerprintStatus();
  }, []);

  const fetchAvailableElections = async () => {
    try {
      setAvailableElections(setLoading(availableElections));
      const response = await api.elections.getAll({ status: 'active' });
      const activeElections = response.data?.filter(election =>
        election.status === 'active' || election.status === 'upcoming'
      ) || [];
      setAvailableElections(setData(availableElections, activeElections));
    } catch (error) {
      setAvailableElections(setError(availableElections, error.message));
    }
  };

  const fetchVotingHistory = async () => {
    try {
      setVotingHistory(setLoading(votingHistory));
      const response = await api.users.getVotingHistory({ user_id: user?.id });
      setVotingHistory(setData(votingHistory, response.data || []));
    } catch (error) {
      setVotingHistory(setError(votingHistory, error.message));
    }
  };

  const fetchFingerprintStatus = async () => {
    try {
      setFingerprintStatus(setLoading(fingerprintStatus));
      // Mock fingerprint status check
      const mockStatus = {
        registered: true,
        lastUsed: '2025-01-08T10:30:00Z',
        scanCount: 5,
        verificationSuccess: 100
      };
      setFingerprintStatus(setData(fingerprintStatus, mockStatus));
    } catch (error) {
      setFingerprintStatus(setError(fingerprintStatus, error.message));
    }
  };

  const getElectionStatusBadge = (election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    if (now < startDate) {
      return { variant: 'info', text: 'Upcoming' };
    } else if (now >= startDate && now <= endDate) {
      return { variant: 'success', text: 'Active' };
    } else {
      return { variant: 'secondary', text: 'Ended' };
    }
  };

  const hasVotedInElection = (electionId) => {
    return votingHistory.data?.some(vote => vote.election_id === electionId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      return `${hours}h remaining`;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-muted mb-0">Your voting dashboard and profile overview</p>
            </div>
            <Button
              variant="outline-primary"
              as={Link}
              to="/user/profile"
            >
              <Settings className="me-2" size={16} />
              Profile Settings
            </Button>
          </div>
        </Col>
      </Row>

      {/* User Profile Summary */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <Person className="text-primary" size={48} />
              </div>
              <h5 className="mb-2">{user?.name || 'User Name'}</h5>
              <p className="text-muted mb-3">{user?.email || 'user@example.com'}</p>
              <div className="d-flex justify-content-center gap-2">
                <Badge bg="success" className="px-3 py-2">
                  <CheckCircle className="me-1" size={12} />
                  Verified
                </Badge>
                <Badge bg="info" className="px-3 py-2">
                  <Activity className="me-1" size={12} />
                  Active
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <Fingerprint className="text-info me-3" size={32} />
                <div>
                  <h6 className="mb-1">Biometric Status</h6>
                  <p className="text-muted mb-0">Fingerprint authentication</p>
                </div>
              </div>
              {fingerprintStatus.isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : fingerprintStatus.error ? (
                <Alert variant="danger" className="small py-2">
                  <ExclamationTriangle className="me-1" size={12} />
                  {fingerprintStatus.error}
                </Alert>
              ) : fingerprintStatus.data?.registered ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Registration Status</small>
                    <Badge bg="success">Registered</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Verification Rate</small>
                    <small className="text-success fw-bold">{fingerprintStatus.data.verificationSuccess}%</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Last Used</small>
                    <small>{formatDate(fingerprintStatus.data.lastUsed)}</small>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <ExclamationTriangle className="text-warning mb-2" size={24} />
                  <p className="text-muted small">No fingerprint registered</p>
                  <Button variant="outline-info" size="sm">
                    Register Fingerprint
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <Vote className="text-success me-3" size={32} />
                <div>
                  <h6 className="mb-1">Voting Statistics</h6>
                  <p className="text-muted mb-0">Your voting activity</p>
                </div>
              </div>
              <div className="row g-3">
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <div className="h4 text-success mb-1">
                      {votingHistory.data?.length || 0}
                    </div>
                    <small className="text-muted">Votes Cast</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <div className="h4 text-primary mb-1">
                      {availableElections.data?.filter(e =>
                        getElectionStatusBadge(e).variant === 'success' &&
                        !hasVotedInElection(e.id)
                      ).length || 0}
                    </div>
                    <small className="text-muted">Available</small>
                  </div>
                </Col>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Elections and Voting History */}
      <Row className="g-4">
        {/* Available Elections */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Available Elections</h5>
                <Badge bg="info">
                  {availableElections.data?.filter(e =>
                    getElectionStatusBadge(e).variant === 'success' &&
                    !hasVotedInElection(e.id)
                  ).length || 0} Active
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {availableElections.isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="text-muted mt-3">Loading elections...</p>
                </div>
              ) : availableElections.error ? (
                <Alert variant="danger">
                  <ExclamationTriangle className="me-2" size={16} />
                  Error loading elections: {availableElections.error}
                </Alert>
              ) : availableElections.data?.length === 0 ? (
                <div className="text-center py-5">
                  <Calendar className="text-muted mb-3" size={48} />
                  <h5 className="text-muted">No Available Elections</h5>
                  <p className="text-muted">Check back later for new voting opportunities</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {availableElections.data.map((election) => {
                    const status = getElectionStatusBadge(election);
                    const hasVoted = hasVotedInElection(election.id);
                    const canVote = status.variant === 'success' && !hasVoted;

                    return (
                      <ListGroup.Item key={election.id} className="px-0">
                        <Card className="border-0 bg-light">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-2">
                                  <h6 className="mb-0 me-3">{election.title}</h6>
                                  <Badge bg={status.variant} className="me-2">
                                    {status.text}
                                  </Badge>
                                  {hasVoted && (
                                    <Badge bg="success">
                                      <CheckCircle className="me-1" size={12} />
                                      Voted
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted mb-3">
                                  {election.description}
                                </p>
                                <div className="d-flex align-items-center gap-4 text-muted small">
                                  <span>
                                    <Clock className="me-1" size={14} />
                                    {getTimeRemaining(election.end_date)}
                                  </span>
                                  <span>
                                    <Calendar className="me-1" size={14} />
                                    Ends {formatDate(election.end_date)}
                                  </span>
                                </div>
                              </div>
                              <div className="ms-3">
                                {canVote ? (
                                  <Button
                                    variant="success"
                                    as={Link}
                                    to={`/election/${election.id}/vote`}
                                  >
                                    <Vote className="me-2" size={16} />
                                    Vote Now
                                  </Button>
                                ) : hasVoted ? (
                                  <Button
                                    variant="outline-info"
                                    as={Link}
                                    to={`/election/${election.id}/results`}
                                  >
                                    <Eye className="me-2" size={16} />
                                    View Results
                                  </Button>
                                ) : status.variant === 'info' ? (
                                  <Button variant="outline-secondary" disabled>
                                    <Clock className="me-2" size={16} />
                                    Upcoming
                                  </Button>
                                ) : (
                                  <Button variant="outline-secondary" disabled>
                                    <ExclamationTriangle className="me-2" size={16} />
                                    Ended
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Voting History */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0">Voting History</h5>
            </Card.Header>
            <Card.Body>
              {votingHistory.isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                  <p className="text-muted mt-2 small">Loading history...</p>
                </div>
              ) : votingHistory.error ? (
                <Alert variant="danger" className="small">
                  <ExclamationTriangle className="me-1" size={12} />
                  {votingHistory.error}
                </Alert>
              ) : votingHistory.data?.length === 0 ? (
                <div className="text-center py-4">
                  <Award className="text-muted mb-2" size={32} />
                  <p className="text-muted small">No voting history yet</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {votingHistory.data.slice(0, 5).map((vote) => (
                    <ListGroup.Item key={vote.id} className="px-0">
                      <div className="d-flex align-items-start">
                        <CheckCircle className="text-success me-3 mt-1 flex-shrink-0" size={16} />
                        <div className="flex-grow-1">
                          <h6 className="mb-1 small">{vote.election_title}</h6>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              Voted for: {vote.candidate_name}
                            </small>
                            <small className="text-muted">
                              {formatDate(vote.vote_date)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                  {votingHistory.data.length > 5 && (
                    <div className="text-center mt-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to="/user/profile"
                      >
                        View All <ArrowRight className="ms-1" size={12} />
                      </Button>
                    </div>
                  )}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;