import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  ListGroup,
  Image
} from 'react-bootstrap';
import {
  PlusCircle,
  Edit,
  Trash,
  Person,
  Search,
  X,
  CheckCircle,
  Upload,
  ExclamationTriangle,
  FileText
} from 'react-bootstrap-icons';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const CandidateManagement = () => {
  const [searchParams] = useSearchParams();
  const [elections, setElections] = useState(createLoadingState());
  const [candidates, setCandidates] = useState(createLoadingState());
  const [selectedElection, setSelectedElection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadPreview, setUploadPreview] = useState(null);

  const [formData, setFormData] = useState({
    election_id: '',
    name: '',
    bio: '',
    photo: null,
    manifesto: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchElections();
    const electionId = searchParams.get('election');
    if (electionId) {
      setSelectedElection(electionId);
      fetchCandidates(electionId);
    }
  }, [searchParams]);

  const fetchElections = async () => {
    try {
      setElections(setLoading(elections));
      const response = await api.elections.getAll();
      setElections(setData(elections, response.data || []));
    } catch (error) {
      setElections(setError(elections, error.message));
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      setCandidates(setLoading(candidates));
      const response = await api.voting.getElectionCandidates(electionId);
      setCandidates(setData(candidates, response.data || []));
    } catch (error) {
      setCandidates(setError(candidates, error.message));
    }
  };

  const handleCreateCandidate = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('election_id', formData.election_id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
      formDataToSend.append('manifesto', formData.manifesto);

      await api.upload('/elections/add_candidate.php', formDataToSend);
      setShowCreateModal(false);
      resetForm();
      if (selectedElection) {
        fetchCandidates(selectedElection);
      }
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const handleEditCandidate = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('candidate_id', selectedCandidate.id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
      formDataToSend.append('manifesto', formData.manifesto);

      await api.upload('/elections/update_candidate.php', formDataToSend);
      setShowEditModal(false);
      resetForm();
      if (selectedElection) {
        fetchCandidates(selectedElection);
      }
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await api.post('/elections/delete_candidate.php', {
        candidate_id: selectedCandidate.id
      });
      setShowDeleteModal(false);
      setSelectedCandidate(null);
      if (selectedElection) {
        fetchCandidates(selectedElection);
      }
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ photo: 'Photo size must be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors({ photo: 'Only image files are allowed' });
        return;
      }

      setFormData({ ...formData, photo: file });
      setFormErrors({ ...formErrors, photo: '' });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.election_id) {
      errors.election_id = 'Please select an election';
    }

    if (!formData.name.trim()) {
      errors.name = 'Candidate name is required';
    }

    if (!formData.bio.trim()) {
      errors.bio = 'Bio is required';
    }

    if (formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    if (!formData.manifesto.trim()) {
      errors.manifesto = 'Manifesto is required';
    }

    if (formData.manifesto.length > 2000) {
      errors.manifesto = 'Manifesto must be less than 2000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      election_id: selectedElection || '',
      name: '',
      bio: '',
      photo: null,
      manifesto: ''
    });
    setFormErrors({});
    setSelectedCandidate(null);
    setUploadPreview(null);
  };

  const openEditModal = (candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      election_id: candidate.election_id,
      name: candidate.name,
      bio: candidate.bio,
      photo: null,
      manifesto: candidate.manifesto || ''
    });
    setUploadPreview(candidate.photo_url || null);
    setShowEditModal(true);
  };

  const openDeleteModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDeleteModal(true);
  };

  const handleElectionSelect = (electionId) => {
    setSelectedElection(electionId);
    if (electionId) {
      fetchCandidates(electionId);
    } else {
      setCandidates(setData(candidates, []));
    }
  };

  const filteredCandidates = candidates.data?.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.bio.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Candidate Management</h1>
              <p className="text-muted mb-0">
                Manage candidates for elections
                {selectedElection && (
                  <span className="ms-2">
                    <Badge bg="primary">
                      {elections.data?.find(e => e.id === selectedElection)?.title || 'Selected Election'}
                    </Badge>
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              disabled={!selectedElection}
            >
              <PlusCircle className="me-2" size={16} />
              Add Candidate
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {formErrors.submit && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setFormErrors({})}>
              <ExclamationTriangle className="me-2" size={16} />
              {formErrors.submit}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Election Selection */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-0 pt-4 pb-3">
          <h5 className="mb-0">Select Election</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Select
                value={selectedElection || ''}
                onChange={(e) => handleElectionSelect(e.target.value)}
              >
                <option value="">Choose an election...</option>
                {elections.data?.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title} ({election.status})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedElection}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Candidates List */}
      {selectedElection && (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pt-4 pb-3">
            <h5 className="mb-0">
              Candidates ({filteredCandidates.length})
            </h5>
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
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-5">
                <Person className="text-muted mb-3" size={48} />
                <h5 className="text-muted">No candidates found</h5>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search' : 'Add candidates to get started'}
                </p>
                {!searchTerm && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      resetForm();
                      setShowCreateModal(true);
                    }}
                  >
                    <PlusCircle className="me-2" size={16} />
                    Add First Candidate
                  </Button>
                )}
              </div>
            ) : (
              <Row className="g-4">
                {filteredCandidates.map((candidate) => (
                  <Col md={6} lg={4} key={candidate.id}>
                    <Card className="h-100 border-0 shadow-sm">
                      {candidate.photo_url && (
                        <div className="text-center p-3 bg-light">
                          <Image
                            src={candidate.photo_url}
                            alt={candidate.name}
                            roundedCircle
                            width={80}
                            height={80}
                            className="border border-white shadow-sm"
                          />
                        </div>
                      )}
                      <Card.Body>
                        <Card.Title className="h6 mb-2">{candidate.name}</Card.Title>
                        <Card.Text className="text-muted small mb-3">
                          {candidate.bio.substring(0, 120)}
                          {candidate.bio.length > 120 && '...'}
                        </Card.Text>
                        {candidate.manifesto && (
                          <div className="mb-3">
                            <Badge bg="light" text="dark" className="small">
                              <FileText size={12} className="me-1" />
                              Manifesto Available
                            </Badge>
                          </div>
                        )}
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="flex-fill"
                            onClick={() => openEditModal(candidate)}
                          >
                            <Edit size={14} className="me-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(candidate)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        show={showCreateModal || showEditModal}
        onHide={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Person className="me-2 text-primary" />
            {showCreateModal ? 'Add New Candidate' : 'Edit Candidate'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Election *</Form.Label>
                  <Form.Select
                    value={formData.election_id}
                    onChange={(e) => setFormData({ ...formData, election_id: e.target.value })}
                    isInvalid={!!formErrors.election_id}
                  >
                    <option value="">Select election...</option>
                    {elections.data?.map((election) => (
                      <option key={election.id} value={election.id}>
                        {election.title}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.election_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Candidate Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter candidate name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                isInvalid={!!formErrors.photo}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.photo}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Upload a photo (max 5MB, JPG/PNG format)
              </Form.Text>
              {uploadPreview && (
                <div className="mt-3 text-center">
                  <Image
                    src={uploadPreview}
                    alt="Preview"
                    roundedCircle
                    width={100}
                    height={100}
                    className="border shadow-sm"
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bio *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Brief biography of the candidate"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                isInvalid={!!formErrors.bio}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.bio}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.bio.length}/500 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Manifesto *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Candidate's manifesto and promises"
                value={formData.manifesto}
                onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                isInvalid={!!formErrors.manifesto}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.manifesto}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.manifesto.length}/2000 characters
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            <X className="me-2" size={16} />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={showCreateModal ? handleCreateCandidate : handleEditCandidate}
          >
            <CheckCircle className="me-2" size={16} />
            {showCreateModal ? 'Add Candidate' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedCandidate(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ExclamationTriangle className="me-2 text-danger" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this candidate:</p>
          <h5 className="text-danger">{selectedCandidate?.name}</h5>
          <p className="text-muted">
            This action cannot be undone and all associated data will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedCandidate(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCandidate}>
            <Trash className="me-2" size={16} />
            Delete Candidate
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CandidateManagement;