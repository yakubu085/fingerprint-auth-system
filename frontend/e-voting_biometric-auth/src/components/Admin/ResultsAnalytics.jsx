import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Form,
  Alert,
  Spinner,
  ProgressBar,
  ListGroup
} from 'react-bootstrap';
import {
  BarChart,
  PieChart,
  Download,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Activity,
  ExclamationTriangle,
  FileEarmarkPdf,
  FileEarmarkExcel
} from 'react-bootstrap-icons';
import { api, createLoadingState, setLoading, setData, setError } from '../../services/api.js';

const ResultsAnalytics = () => {
  const [elections, setElections] = useState(createLoadingState());
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(createLoadingState());
  const [voterStats, setVoterStats] = useState(createLoadingState());
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchElectionResults(selectedElection);
      fetchVoterStatistics(selectedElection);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      setElections(setLoading(elections));
      const response = await api.elections.getAll();
      const completedElections = response.data?.filter(e => e.status === 'completed') || [];
      setElections(setData(elections, completedElections));
    } catch (error) {
      setElections(setError(elections, error.message));
    }
  };

  const fetchElectionResults = async (electionId) => {
    try {
      setResults(setLoading(results));
      const response = await api.voting.getResults(electionId);
      setResults(setData(results, response.data || {}));
    } catch (error) {
      setResults(setError(results, error.message));
    }
  };

  const fetchVoterStatistics = async (electionId) => {
    try {
      setVoterStats(setLoading(voterStats));
      // Mock voter statistics data
      const mockStats = {
        totalVoters: 1250,
        votesCast: 987,
        averageVotingTime: '2m 45s',
        peakVotingHour: '14:00-15:00',
        votingTrend: [
          { hour: '09:00', votes: 45 },
          { hour: '10:00', votes: 78 },
          { hour: '11:00', votes: 92 },
          { hour: '12:00', votes: 156 },
          { hour: '13:00', votes: 201 },
          { hour: '14:00', votes: 289 },
          { hour: '15:00', votes: 126 }
        ]
      };
      setVoterStats(setData(voterStats, mockStats));
    } catch (error) {
      setVoterStats(setError(voterStats, error.message));
    }
  };

  const exportResults = async () => {
    if (!selectedElection || !results.data) return;

    try {
      const electionData = elections.data?.find(e => e.id === selectedElection);
      const csvContent = generateCSV(results.data, electionData);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${electionData?.title || 'election_results'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const generateCSV = (resultsData, electionData) => {
    const headers = ['Candidate Name', 'Vote Count', 'Percentage', 'Status'];
    const rows = resultsData.candidates?.map(candidate => [
      candidate.name,
      candidate.votes,
      `${candidate.percentage}%`,
      candidate.winner ? 'Winner' : ''
    ]) || [];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getWinner = () => {
    if (!results.data?.candidates) return null;
    return results.data.candidates.reduce((prev, current) =>
      (prev.votes > current.votes) ? prev : current
    );
  };

  const calculateTurnoutPercentage = () => {
    if (!voterStats.data) return 0;
    return Math.round((voterStats.data.votesCast / voterStats.data.totalVoters) * 100);
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Results & Analytics</h1>
              <p className="text-muted mb-0">
                Election results visualization and voter analytics
                {selectedElection && (
                  <span className="ms-2">
                    <Badge bg="primary">
                      {elections.data?.find(e => e.id === selectedElection)?.title || 'Selected Election'}
                    </Badge>
                  </span>
                )}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Form.Select
                style={{ width: '200px' }}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                disabled={!selectedElection}
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </Form.Select>
              <Button
                variant="success"
                onClick={exportResults}
                disabled={!selectedElection || !results.data}
              >
                <Download className="me-2" size={16} />
                Export Results
              </Button>
            </div>
          </div>
        </Col>
      </Row>

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
                onChange={(e) => setSelectedElection(e.target.value)}
              >
                <option value="">Choose a completed election...</option>
                {elections.data?.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title} ({election.end_date})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <div className="text-muted">
                {elections.data ? `${elections.data.length} completed elections` : 'Loading...'}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {selectedElection && (
        <>
          {/* Overview Statistics */}
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <Users className="text-primary mb-2" size={32} />
                  <h4 className="mb-1">
                    {voterStats.isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : voterStats.data ? (
                      voterStats.data.votesCast.toLocaleString()
                    ) : (
                      '0'
                    )}
                  </h4>
                  <p className="text-muted mb-0">Total Votes Cast</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <Activity className="text-success mb-2" size={32} />
                  <h4 className="mb-1">
                    {voterStats.isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : voterStats.data ? (
                      `${calculateTurnoutPercentage()}%`
                    ) : (
                      '0%'
                    )}
                  </h4>
                  <p className="text-muted mb-0">Voter Turnout</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <Clock className="text-info mb-2" size={32} />
                  <h4 className="mb-1">
                    {voterStats.isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : voterStats.data ? (
                      voterStats.data.averageVotingTime
                    ) : (
                      '0m'
                    )}
                  </h4>
                  <p className="text-muted mb-0">Avg. Voting Time</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <TrendingUp className="text-warning mb-2" size={32} />
                  <h4 className="mb-1">
                    {voterStats.isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : voterStats.data ? (
                      voterStats.data.peakVotingHour
                    ) : (
                      'N/A'
                    )}
                  </h4>
                  <p className="text-muted mb-0">Peak Voting Hour</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Results and Analytics */}
          <Row className="g-4">
            {/* Election Results */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-3">
                  <h5 className="mb-0">Election Results</h5>
                </Card.Header>
                <Card.Body>
                  {results.isLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                      <p className="text-muted mt-3">Loading results...</p>
                    </div>
                  ) : results.error ? (
                    <Alert variant="danger">
                      <ExclamationTriangle className="me-2" size={16} />
                      Error loading results: {results.error}
                    </Alert>
                  ) : !results.data?.candidates ? (
                    <div className="text-center py-5">
                      <BarChart className="text-muted mb-3" size={48} />
                      <h5 className="text-muted">No Results Available</h5>
                      <p className="text-muted">Results will be available when the election is completed</p>
                    </div>
                  ) : (
                    <>
                      {/* Winner Announcement */}
                      {(() => {
                        const winner = getWinner();
                        return winner ? (
                          <Alert variant="success" className="mb-4">
                            <CheckCircle className="me-2" size={20} />
                            <strong>Winner: {winner.name}</strong> with {winner.votes.toLocaleString()} votes ({winner.percentage}%)
                          </Alert>
                        ) : null;
                      })()}

                      {/* Results Table */}
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Candidate</th>
                            <th>Votes</th>
                            <th>Percentage</th>
                            <th>Progress</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.data.candidates
                            .sort((a, b) => b.votes - a.votes)
                            .map((candidate, index) => (
                              <tr key={candidate.id}>
                                <td>
                                  <Badge bg={index === 0 ? 'success' : 'secondary'}>
                                    #{index + 1}
                                  </Badge>
                                </td>
                                <td>
                                  <strong>{candidate.name}</strong>
                                </td>
                                <td>
                                  <strong>{candidate.votes.toLocaleString()}</strong>
                                </td>
                                <td>{candidate.percentage}%</td>
                                <td>
                                  <ProgressBar
                                    now={candidate.percentage}
                                    variant={index === 0 ? 'success' : 'primary'}
                                    style={{ height: '8px' }}
                                  />
                                </td>
                                <td>
                                  {index === 0 && (
                                    <Badge bg="success">Winner</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Voting Analytics */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 pb-3">
                  <h5 className="mb-0">Voting Analytics</h5>
                </Card.Header>
                <Card.Body>
                  {voterStats.isLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" size="sm" />
                      <p className="text-muted mt-2">Loading analytics...</p>
                    </div>
                  ) : voterStats.error ? (
                    <Alert variant="danger" className="small">
                      Error loading analytics: {voterStats.error}
                    </Alert>
                  ) : voterStats.data ? (
                    <>
                      {/* Voting Trend */}
                      <div className="mb-4">
                        <h6 className="mb-3">Voting Trend by Hour</h6>
                        <ListGroup variant="flush">
                          {voterStats.data.votingTrend?.map((item, index) => (
                            <ListGroup.Item key={index} className="px-0">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="small">{item.hour}</span>
                                <div className="d-flex align-items-center">
                                  <ProgressBar
                                    now={(item.votes / Math.max(...voterStats.data.votingTrend.map(t => t.votes))) * 100}
                                    variant="info"
                                    style={{ width: '100px', height: '6px', marginRight: '10px' }}
                                  />
                                  <span className="small fw-bold">{item.votes}</span>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>

                      {/* Key Statistics */}
                      <div className="mb-4">
                        <h6 className="mb-3">Key Statistics</h6>
                        <div className="row g-3">
                          <Col xs={6}>
                            <div className="text-center p-3 bg-light rounded">
                              <div className="h4 text-primary mb-1">
                                {calculateTurnoutPercentage()}%
                              </div>
                              <small className="text-muted">Turnout Rate</small>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="text-center p-3 bg-light rounded">
                              <div className="h4 text-success mb-1">
                                {voterStats.data.totalVoters.toLocaleString()}
                              </div>
                              <small className="text-muted">Registered</small>
                            </div>
                          </Col>
                        </div>
                      </div>

                      {/* Export Options */}
                      <div>
                        <h6 className="mb-3">Export Options</h6>
                        <div className="d-grid gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={exportResults}
                          >
                            <FileEarmarkExcel className="me-2" size={14} />
                            Export as CSV
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled
                          >
                            <FileEarmarkPdf className="me-2" size={14} />
                            Export as PDF (Coming Soon)
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <Activity className="text-muted mb-3" size={32} />
                      <p className="text-muted">No analytics data available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {!selectedElection && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <BarChart className="text-muted mb-3" size={48} />
            <h5 className="text-muted">Select an Election</h5>
            <p className="text-muted">
              Choose a completed election to view detailed results and analytics
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ResultsAnalytics;