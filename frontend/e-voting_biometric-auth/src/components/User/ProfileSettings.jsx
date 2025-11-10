import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Alert,
  Spinner,
  ListGroup,
  Modal,
  Tabs,
  Tab
} from 'react-bootstrap';
import {
  Person,
  Lock,
  Fingerprint,
  ShieldCheck,
  Eye,
  EyeSlash,
  CheckCircle,
  ExclamationTriangle,
  Upload,
  Trash,
  Activity,
  Vote,
  Calendar
} from 'react-bootstrap-icons';
import { AuthContext } from '../../context/AuthContext.jsx';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const ProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile update state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Fingerprint state
  const [fingerprintStatus, setFingerprintStatus] = useState(createLoadingState());
  const [fingerprintLoading, setFingerprintLoading] = useState(false);

  // Voting history state
  const [votingHistory, setVotingHistory] = useState(createLoadingState());

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    fetchVotingHistory();
    fetchFingerprintStatus();
  }, [user]);

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
      // Mock fingerprint status
      const mockStatus = {
        registered: true,
        lastUsed: '2025-01-08T10:30:00Z',
        scanCount: 5,
        verificationSuccess: 100,
        templateVersion: '2.1'
      };
      setFingerprintStatus(setData(fingerprintStatus, mockStatus));
    } catch (error) {
      setFingerprintStatus(setError(fingerprintStatus, error.message));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await api.users.updateProfile({
        user_id: user?.id,
        ...profileData
      });

      // Update local user context
      updateUser({
        ...user,
        ...profileData
      });

      setProfileSuccess('Profile updated successfully!');
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = validatePasswordForm();

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});

    try {
      await api.users.changePassword({
        user_id: user?.id,
        ...passwordData
      });

      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Show success message in main profile
      setProfileSuccess('Password changed successfully!');
    } catch (error) {
      setPasswordErrors({ submit: error.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }

    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirm_password) {
      errors.confirm_password = 'Please confirm your new password';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    return errors;
  };

  const handleFingerprintRegister = async () => {
    setFingerprintLoading(true);

    try {
      // Simulate fingerprint registration process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update fingerprint status
      setFingerprintStatus(setData(fingerprintStatus, {
        registered: true,
        lastUsed: new Date().toISOString(),
        scanCount: 1,
        verificationSuccess: 100,
        templateVersion: '2.1'
      }));

      setShowFingerprintModal(false);
      setProfileSuccess('Fingerprint registered successfully!');
    } catch (error) {
      setProfileError('Failed to register fingerprint. Please try again.');
    } finally {
      setFingerprintLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // This would be a real API call to delete the account
      await new Promise(resolve => setTimeout(resolve, 1000));

      // After successful deletion, redirect to login or home page
      window.location.href = '/login';
    } catch (error) {
      setProfileError('Failed to delete account. Please try again.');
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

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-1">Profile Settings</h1>
          <p className="text-muted mb-0">Manage your account and preferences</p>
        </Col>
      </Row>

      {/* Success/Error Messages */}
      {profileSuccess && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" dismissible onClose={() => setProfileSuccess(null)}>
              <CheckCircle className="me-2" size={16} />
              {profileSuccess}
            </Alert>
          </Col>
        </Row>
      )}

      {profileError && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setProfileError(null)}>
              <ExclamationTriangle className="me-2" size={16} />
              {profileError}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={4}>
          {/* Profile Summary Card */}
          <Card className="border-0 shadow-sm mb-4">
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

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Lock className="me-2" size={16} />
                  Change Password
                </Button>
                <Button
                  variant="outline-info"
                  onClick={() => setShowFingerprintModal(true)}
                >
                  <Fingerprint className="me-2" size={16} />
                  {fingerprintStatus.data?.registered ? 'Update Fingerprint' : 'Register Fingerprint'}
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash className="me-2" size={16} />
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0">Account Settings</h5>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="profile" title="Profile Information">
                  <Form onSubmit={handleProfileUpdate}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-end">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={profileLoading}
                      >
                        {profileLoading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="me-2" size={16} />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey="security" title="Security">
                  <div className="py-4">
                    <h6 className="mb-4">Security Settings</h6>

                    {/* Fingerprint Status */}
                    <Card className="bg-light mb-4">
                      <Card.Body>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <Fingerprint className="text-info me-3" size={24} />
                            <div>
                              <h6 className="mb-1">Biometric Authentication</h6>
                              <p className="text-muted mb-0">
                                {fingerprintStatus.data?.registered
                                  ? 'Fingerprint registered and active'
                                  : 'No fingerprint registered'}
                              </p>
                            </div>
                          </div>
                          <Badge bg={fingerprintStatus.data?.registered ? 'success' : 'warning'}>
                            {fingerprintStatus.data?.registered ? 'Active' : 'Not Registered'}
                          </Badge>
                        </div>
                        {fingerprintStatus.data?.registered && (
                          <div className="mt-3 small text-muted">
                            <div>Last used: {formatDate(fingerprintStatus.data.lastUsed)}</div>
                            <div>Verification success rate: {fingerprintStatus.data.verificationSuccess}%</div>
                            <div>Scan count: {fingerprintStatus.data.scanCount}</div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>

                    {/* Password Change */}
                    <Card className="bg-light">
                      <Card.Body>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <Lock className="text-primary me-3" size={24} />
                            <div>
                              <h6 className="mb-1">Password</h6>
                              <p className="text-muted mb-0">Change your account password</p>
                            </div>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowPasswordModal(true)}
                          >
                            Change Password
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Tab>

                <Tab eventKey="history" title="Voting History">
                  <div className="py-4">
                    <h6 className="mb-4">Your Voting History</h6>
                    {votingHistory.isLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="text-muted mt-3">Loading voting history...</p>
                      </div>
                    ) : votingHistory.error ? (
                      <Alert variant="danger">
                        <ExclamationTriangle className="me-2" size={16} />
                        Error loading voting history: {votingHistory.error}
                      </Alert>
                    ) : votingHistory.data?.length === 0 ? (
                      <div className="text-center py-5">
                        <Vote className="text-muted mb-3" size={48} />
                        <h6 className="text-muted">No voting history</h6>
                        <p className="text-muted">You haven't voted in any elections yet</p>
                      </div>
                    ) : (
                      <ListGroup variant="flush">
                        {votingHistory.data.map((vote) => (
                          <ListGroup.Item key={vote.id} className="px-0">
                            <div className="d-flex align-items-start">
                              <CheckCircle className="text-success me-3 mt-1 flex-shrink-0" size={16} />
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{vote.election_title}</h6>
                                <p className="text-muted mb-2">
                                  Voted for: <strong>{vote.candidate_name}</strong>
                                </p>
                                <div className="d-flex align-items-center gap-3 text-muted small">
                                  <span>
                                    <Calendar className="me-1" size={12} />
                                    {formatDate(vote.vote_date)}
                                  </span>
                                  <Badge bg="success" className="small">Confirmed</Badge>
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Lock className="me-2 text-primary" />
            Change Password
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordChange}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  isInvalid={!!passwordErrors.current_password}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {passwordErrors.current_password}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  isInvalid={!!passwordErrors.new_password}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {passwordErrors.new_password}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  isInvalid={!!passwordErrors.confirm_password}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {passwordErrors.confirm_password}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            {passwordErrors.submit && (
              <Alert variant="danger">
                <ExclamationTriangle className="me-2" size={16} />
                {passwordErrors.submit}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <CheckCircle className="me-2" size={16} />
                  Change Password
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Fingerprint Registration Modal */}
      <Modal show={showFingerprintModal} onHide={() => setShowFingerprintModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Fingerprint className="me-2 text-info" />
            {fingerprintStatus.data?.registered ? 'Update Fingerprint' : 'Register Fingerprint'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <Fingerprint className="text-info mb-3" size={64} />
          <h5 className="mb-3">
            {fingerprintStatus.data?.registered ? 'Update Your Fingerprint' : 'Register Your Fingerprint'}
          </h5>
          <p className="text-muted mb-4">
            {fingerprintStatus.data?.registered
              ? 'Update your fingerprint template for enhanced security.'
              : 'Register your fingerprint for secure biometric authentication.'}
          </p>

          {fingerprintLoading ? (
            <div>
              <Spinner animation="border" />
              <p className="text-muted mt-3">Processing fingerprint...</p>
            </div>
          ) : (
            <Alert variant="info">
              <ShieldCheck className="me-2" size={16} />
              Your fingerprint data is encrypted and stored securely. It cannot be accessed by anyone.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowFingerprintModal(false)}>
            Cancel
          </Button>
          <Button
            variant="info"
            onClick={handleFingerprintRegister}
            disabled={fingerprintLoading}
          >
            {fingerprintLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <Fingerprint className="me-2" size={16} />
                {fingerprintStatus.data?.registered ? 'Update Fingerprint' : 'Register Fingerprint'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Trash className="me-2 text-danger" />
            Delete Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <ExclamationTriangle className="me-2" size={16} />
            <strong>Warning:</strong> This action cannot be undone.
          </Alert>
          <p>
            Deleting your account will permanently remove:
          </p>
          <ul>
            <li>Your profile information</li>
            <li>Voting history</li>
            <li>Fingerprint data</li>
            <li>All account settings</li>
          </ul>
          <p className="text-muted">
            If you're sure you want to proceed, type "DELETE" in the box below:
          </p>
          <Form.Control
            type="text"
            placeholder="Type DELETE to confirm"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            <Trash className="me-2" size={16} />
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfileSettings;