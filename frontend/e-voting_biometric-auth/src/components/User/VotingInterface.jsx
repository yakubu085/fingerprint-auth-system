import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Alert,
  Spinner,
  Form,
  ProgressBar
} from 'react-bootstrap';
import {
  CheckCircle,
  ExclamationTriangle,
  Fingerprint,
  ShieldCheck,
  Clock,
  Users,
  AlertCircle,
  ArrowLeft,
  Vote,
  Award,
  FileText
} from 'react-bootstrap-icons';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const VotingInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(createLoadingState());
  const [candidates, setCandidates] = useState(createLoadingState());
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fingerprintStatus, setFingerprintStatus] = useState('pending');
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [voteError, setVoteError] = useState(null);

  useEffect(() => {
    fetchElectionDetails();
    fetchCandidates();
  }, [id]);

  const fetchElectionDetails = async () => {
    try {
      setElection(setLoading(election));
      const response = await api.elections.getAll();
      const electionData = response.data?.find(e => e.id === id);
      if (electionData) {
        setElection(setData(election, electionData));
      } else {
        setElection(setError(election, 'Election not found'));
      }
    } catch (error) {
      setElection(setError(election, error.message));
    }
  };

  const fetchCandidates = async () => {
    try {
      setCandidates(setLoading(candidates));
      const response = await api.voting.getElectionCandidates(id);
      setCandidates(setData(candidates, response.data || []));
    } catch (error) {
      setCandidates(setError(candidates, error.message));
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidate(candidateId);
    setVoteError(null);
  };

  const handleVoteConfirm = () => {
    if (!selectedCandidate) {
      setVoteError('Please select a candidate to vote for');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFingerprintScan = async () => {
    setShowFingerprintModal(true);
    setFingerprintStatus('scanning');

    try {
      // Simulate fingerprint scanning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFingerprintStatus('processing');

      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFingerprintStatus('verified');

      // Proceed to cast vote
      await castVote();
    } catch (error) {
      setFingerprintStatus('error');
      setVoteError('Fingerprint verification failed. Please try again.');
    }
  };

  const castVote = async () => {
    try {
      const voteData = {
        election_id: id,
        candidate_id: selectedCandidate,
        timestamp: new Date().toISOString(),
        fingerprint_verified: true
      };

      const response = await api.voting.castVote(voteData);

      // Generate vote receipt
      const receipt = {
        electionId: id,
        electionTitle: election.data?.title,
        candidateName: candidates.data?.find(c => c.id === selectedCandidate)?.name,
        timestamp: new Date().toISOString(),
        verificationCode: `VOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      setVoteReceipt(receipt);
      setShowFingerprintModal(false);
      setShowSuccessModal(true);
      setShowConfirmModal(false);
    } catch (error) {
      setFingerprintStatus('error');
      setVoteError(error.message || 'Failed to cast vote. Please try again.');
    }
  };

  const getTimeRemaining = () => {
    if (!election.data?.end_date) return null;

    const now = new Date();
    const end = new Date(election.data.end_date);
    const diff = end - now;

    if (diff <= 0) return 'Election ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFingerprintStatusMessage = () => {
    switch (fingerprintStatus) {
      case 'scanning':
        return 'Place your finger on the scanner...';
      case 'processing':
        return 'Verifying fingerprint...';
      case 'verified':
        return 'Fingerprint verified successfully!';
      case 'error':
        return 'Fingerprint verification failed';
      default:
        return 'Ready to scan';
    }
  };

  const getFingerprintProgress = () => {
    switch (fingerprintStatus) {
      case 'scanning':
        return 33;
      case 'processing':
        return 66;
      case 'verified':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={() => navigate('/user/dashboard')}
            >
              <ArrowLeft className="me-2" size={16} />
              Back
            </Button>
            <div>
              <h1 className="h3 mb-1">Voting Booth</h1>
              <p className="text-muted mb-0">Cast your vote securely</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {voteError && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setVoteError(null)}>
              <ExclamationTriangle className="me-2" size={16} />
              {voteError}
            </Alert>
          </Col>
        </Row>
      )}

      {election.isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="text-muted mt-3">Loading election details...</p>
        </div>
      ) : election.error ? (
        <Alert variant="danger">
          <ExclamationTriangle className="me-2" size={16} />
          Error: {election.error}
        </Alert>
      ) : (
        <>
          {/* Election Information */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h4 mb-1">{election.data?.title}</h2>
                  <p className="text-muted mb-0">{election.data?.description}</p>
                </div>
                <div className="text-end">
                  <Badge bg="success" className="mb-2">Active</Badge>
                  <div className="text-muted small">
                    <Clock className="me-1" size={14} />
                    {getTimeRemaining()}
                  </div>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <Calendar className="text-primary me-3" size={20} />
                    <div>
                      <small className="text-muted">Start Date</small>
                      <div className="fw-bold">{formatDate(election.data?.start_date)}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <Clock className="text-warning me-3" size={20} />
                    <div>
                      <small className="text-muted">End Date</small>
                      <div className="fw-bold">{formatDate(election.data?.end_date)}</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Instructions */}
          <Card className="border-0 shadow-sm mb-4 bg-info bg-opacity-10">
            <Card.Body className="text-center py-4">
              <ShieldCheck className="text-info mb-3" size={48} />
              <h5 className="mb-3">Secure Voting Instructions</h5>
              <div className="row text-start">
                <Col md={4}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px' }}>1</div>
                    <span>Review all candidates carefully</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px' }}>2</div>
                    <span>Select your preferred candidate</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px' }}>3</div>
                    <span>Verify with fingerprint and confirm</span>
                  </div>
                </Col>
              </div>
            </Card.Body>
          </Card>

          {/* Candidates Selection */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0">Select Your Candidate</h5>
            </Card.Header>
            <Card.Body>
              {candidates.isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="text-muted mt-3">Loading candidates...</p>
                </div>
              ) : candidates.error ? (
                <Alert variant="danger">
                  <ExclamationTriangle className="me-2" size={16} />
                  Error loading candidates: {candidates.error}
                </Alert>
              ) : candidates.data?.length === 0 ? (
                <div className="text-center py-5">
                  <Users className="text-muted mb-3" size={48} />
                  <h5 className="text-muted">No Candidates Available</h5>
                </div>
              ) : (
                <Row className="g-4">
                  {candidates.data.map((candidate) => (
                    <Col md={6} lg={4} key={candidate.id}>
                      <Card
                        className={`h-100 cursor-pointer border-2 ${
                          selectedCandidate === candidate.id
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-0 shadow-sm'
                        }`}
                        onClick={() => handleCandidateSelect(candidate.id)}
                      >
                        <Card.Body className="text-center p-4">
                          {candidate.photo_url && (
                            <div className="mb-3">
                              <img
                                src={candidate.photo_url}
                                alt={candidate.name}
                                className="rounded-circle border border-white shadow-sm"
                                width={80}
                                height={80}
                              />
                            </div>
                          )}
                          <Card.Title className="h6 mb-3">{candidate.name}</Card.Title>
                          <Card.Text className="text-muted small mb-3">
                            {candidate.bio?.substring(0, 150)}
                            {candidate.bio?.length > 150 && '...'}
                          </Card.Text>
                          {candidate.manifesto && (
                            <Badge bg="light" text="dark" className="small">
                              <FileText size={12} className="me-1" />
                              Manifesto
                            </Badge>
                          )}
                          {selectedCandidate === candidate.id && (
                            <div className="mt-3">
                              <Badge bg="success" className="px-3 py-2">
                                <CheckCircle className="me-1" size={16} />
                                Selected
                              </Badge>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Vote Button */}
          <div className="text-center">
            <Button
              variant="success"
              size="lg"
              className="px-5 py-3"
              onClick={handleVoteConfirm}
              disabled={!selectedCandidate || candidates.isLoading}
            >
              <Vote className="me-2" size={20} />
              Cast Your Vote
            </Button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertCircle className="me-2 text-warning" />
            Confirm Your Vote
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to cast your vote for:</p>
          <div className="text-center py-3">
            <h5 className="text-primary">
              {candidates.data?.find(c => c.id === selectedCandidate)?.name}
            </h5>
          </div>
          <Alert variant="warning">
            <strong>Important:</strong> This action cannot be undone. Once your vote is cast, it cannot be changed.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleFingerprintScan}>
            <Fingerprint className="me-2" size={16} />
            Verify & Submit Vote
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Fingerprint Modal */}
      <Modal show={showFingerprintModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>
            <Fingerprint className="me-2 text-primary" />
            Biometric Verification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-4">
            <Fingerprint
              className={`${
                fingerprintStatus === 'verified'
                  ? 'text-success'
                  : fingerprintStatus === 'error'
                  ? 'text-danger'
                  : 'text-primary'
              }`}
              size={64}
            />
          </div>

          <h5 className="mb-3">{getFingerprintStatusMessage()}</h5>

          {fingerprintStatus !== 'pending' && (
            <div className="mb-4">
              <ProgressBar
                now={getFingerprintProgress()}
                variant={
                  fingerprintStatus === 'verified'
                    ? 'success'
                    : fingerprintStatus === 'error'
                    ? 'danger'
                    : 'primary'
                }
                animated={fingerprintStatus !== 'verified' && fingerprintStatus !== 'error'}
                className="mb-3"
              />
            </div>
          )}

          {fingerprintStatus === 'scanning' && (
            <p className="text-muted">
              Place your index finger gently on the scanner and wait for verification.
            </p>
          )}

          {fingerprintStatus === 'processing' && (
            <p className="text-muted">
              Verifying your fingerprint with our secure database...
            </p>
          )}

          {fingerprintStatus === 'verified' && (
            <Alert variant="success">
              <CheckCircle className="me-2" size={16} />
              Biometric verification successful! Processing your vote...
            </Alert>
          )}

          {fingerprintStatus === 'error' && (
            <Alert variant="danger">
              <ExclamationTriangle className="me-2" size={16} />
              Verification failed. Please try again.
            </Alert>
          )}
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => navigate('/user/dashboard')} centered backdrop="static">
        <Modal.Header>
          <Modal.Title>
            <CheckCircle className="me-2 text-success" />
            Vote Cast Successfully!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            <Award className="me-2" size={16} />
            Your vote has been securely recorded and will be counted in the final results.
          </Alert>

          {voteReceipt && (
            <div className="bg-light p-3 rounded">
              <h6 className="mb-3">Vote Receipt</h6>
              <div className="small">
                <div className="mb-2">
                  <strong>Election:</strong> {voteReceipt.electionTitle}
                </div>
                <div className="mb-2">
                  <strong>Candidate:</strong> {voteReceipt.candidateName}
                </div>
                <div className="mb-2">
                  <strong>Time:</strong> {formatDate(voteReceipt.timestamp)}
                </div>
                <div className="mb-0">
                  <strong>Verification Code:</strong> <code className="bg-white px-2 py-1 rounded">{voteReceipt.verificationCode}</code>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => navigate('/user/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VotingInterface;