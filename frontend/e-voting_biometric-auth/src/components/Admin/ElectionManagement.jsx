import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Pagination
} from 'react-bootstrap';
import {
  PlusCircle,
  Edit,
  Trash,
  Eye,
  Calendar,
  Clock,
  Users,
  Search,
  X,
  CheckCircle,
  ExclamationTriangle
} from 'react-bootstrap-icons';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const ElectionManagement = () => {
  const [elections, setElections] = useState(createLoadingState());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setElections(setLoading(elections));
      const response = await api.elections.getAll();
      setElections(setData(elections, response.data || []));
    } catch (error) {
      setElections(setError(elections, error.message));
    }
  };

  const handleCreateElection = async () => {
    if (!validateForm()) return;

    try {
      await api.elections.create(formData);
      setShowCreateModal(false);
      resetForm();
      fetchElections();
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const handleEditElection = async () => {
    if (!validateForm()) return;

    try {
      await api.elections.update({
        ...formData,
        election_id: selectedElection.id
      });
      setShowEditModal(false);
      resetForm();
      fetchElections();
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const handleDeleteElection = async () => {
    try {
      await api.elections.delete(selectedElection.id);
      setShowDeleteModal(false);
      setSelectedElection(null);
      fetchElections();
    } catch (error) {
      setFormErrors({ submit: error.message });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date &&
        new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.end_date = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'upcoming'
    });
    setFormErrors({});
    setSelectedElection(null);
  };

  const openEditModal = (election) => {
    setSelectedElection(election);
    setFormData({
      title: election.title,
      description: election.description,
      start_date: election.start_date,
      end_date: election.end_date,
      status: election.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (election) => {
    setSelectedElection(election);
    setShowDeleteModal(true);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'warning';
    }
  };

  const filteredElections = elections.data?.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || election.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredElections.length / itemsPerPage);
  const paginatedElections = filteredElections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Election Management</h1>
              <p className="text-muted mb-0">Create and manage elections</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <PlusCircle className="me-2" size={16} />
              Create Election
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

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Elections Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4 pb-3">
          <h5 className="mb-0">Elections ({filteredElections.length})</h5>
        </Card.Header>
        <Card.Body>
          {elections.isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-muted mt-3">Loading elections...</p>
            </div>
          ) : elections.error ? (
            <Alert variant="danger">
              <ExclamationTriangle className="me-2" size={16} />
              Error loading elections: {elections.error}
            </Alert>
          ) : filteredElections.length === 0 ? (
            <div className="text-center py-5">
              <Calendar className="text-muted mb-3" size={48} />
              <h5 className="text-muted">No elections found</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first election to get started'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                >
                  <PlusCircle className="me-2" size={16} />
                  Create First Election
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Election</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Candidates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedElections.map((election) => (
                    <tr key={election.id}>
                      <td>
                        <div>
                          <strong>{election.title}</strong>
                          <br />
                          <small className="text-muted">
                            {election.description.substring(0, 80)}
                            {election.description.length > 80 && '...'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(election.status)}>
                          {election.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Calendar className="me-2 text-muted" size={14} />
                          <small>{formatDate(election.start_date)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Clock className="me-2 text-muted" size={14} />
                          <small>{formatDate(election.end_date)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Users className="me-2 text-muted" size={14} />
                          <span>{election.candidate_count || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Button
                            variant="outline-info"
                            size="sm"
                            as={Link}
                            to={`/admin/candidates?election=${election.id}`}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openEditModal(election)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(election)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={currentPage === index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

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
            <PlusCircle className="me-2 text-primary" />
            {showCreateModal ? 'Create New Election' : 'Edit Election'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Election Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter election title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    isInvalid={!!formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter election description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    isInvalid={!!formErrors.start_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.start_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    isInvalid={!!formErrors.end_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.end_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
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
            onClick={showCreateModal ? handleCreateElection : handleEditElection}
          >
            <CheckCircle className="me-2" size={16} />
            {showCreateModal ? 'Create Election' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedElection(null);
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
          <p>Are you sure you want to delete the election:</p>
          <h5 className="text-danger">{selectedElection?.title}</h5>
          <p className="text-muted">
            This action cannot be undone. All associated data including votes and candidates will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedElection(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteElection}>
            <Trash className="me-2" size={16} />
            Delete Election
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ElectionManagement;