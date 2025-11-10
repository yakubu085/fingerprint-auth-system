import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Alert,
  ProgressBar,
  Tabs,
  Tab,
  ListGroup
} from 'react-bootstrap';
import {
  Fingerprint,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  ArrowRepeat,
  InfoCircle,
  ShieldCheck,
  Speedometer2,
  Eye
} from 'react-bootstrap-icons';
import { api } from '../services/api';

const ScannerDemo = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scanAnimation, setScanAnimation] = useState(false);

  const demoSteps = [
    {
      title: "Prepare Your Finger",
      description: "Clean and dry your index finger thoroughly",
      icon: <InfoCircle size={32} />,
      tips: [
        "Wash hands with soap and water",
        "Dry completely with a clean cloth",
        "Remove any lotions or oils"
      ]
    },
    {
      title: "Position Finger",
      description: "Place your finger flat on the scanner surface",
      icon: <Fingerprint size={32} />,
      tips: [
        "Use index finger for best results",
        "Apply gentle, even pressure",
        "Cover entire sensor surface"
      ]
    },
    {
      title: "Wait for Scan",
      description: "Hold still while the scanner captures your fingerprint",
      icon: <ArrowRepeat size={32} />,
      tips: [
        "Keep finger steady for 2-3 seconds",
        "Don't press too hard",
        "Wait for green confirmation light"
      ]
    },
    {
      title: "Verification",
      description: "System processes and verifies your fingerprint",
      icon: <ShieldCheck size={32} />,
      tips: [
        "Template is encrypted immediately",
        "Matched against stored data",
        "Result displayed in seconds"
      ]
    }
  ];

  const troubleshootingTips = [
    {
      problem: "Scanner not detecting finger",
      solution: "Ensure finger is clean and dry, apply gentle pressure"
    },
    {
      problem: "Poor scan quality",
      solution: "Reposition finger, ensure full contact with sensor"
    },
    {
      problem: "Scan timeout",
      solution: "Hold finger steady and try again quickly"
    },
    {
      problem: "Verification failed",
      solution: "Try different finger or re-register fingerprint"
    }
  ];

  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            setScanAnimation(false);
            // Simulate successful scan
            setTimeout(() => {
              setScanResult({
                success: true,
                message: "Fingerprint captured successfully!",
                template: "demo_template_" + Math.random().toString(36).substr(2, 9)
              });
            }, 500);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const startScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setScanProgress(0);
    setScanAnimation(true);
    setActiveStep(1);
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    setScanProgress(0);
    setScanAnimation(false);
    setActiveStep(0);
  };

  const simulateScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      setError(null);

      // Simulate API call
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API delay
      setTimeout(async () => {
        try {
          // In real implementation, this would call the actual API
          // const result = await api.fingerprint.scan();

          // For demo, simulate success
          setScanProgress(100);
          setScanResult({
            success: true,
            message: "Fingerprint scan completed successfully!",
            template: "demo_fingerprint_template_" + Date.now()
          });
        } catch (error) {
          setError(error.message || "Scan failed. Please try again.");
        } finally {
          setIsScanning(false);
          clearInterval(progressInterval);
        }
      }, 2000);

    } catch (error) {
      setError(error.message || "Failed to start scan");
      setIsScanning(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-primary text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <Fingerprint className="me-3" size={40} />
                <div>
                  <h1 className="mb-1">Biometric Scanner Demo</h1>
                  <p className="mb-0 opacity-75">Experience secure fingerprint authentication</p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <Button variant="outline-light" onClick={() => setShowGuide(true)}>
                <InfoCircle className="me-2" size={16} />
                User Guide
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          {/* Main Scanner Interface */}
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <Fingerprint className="me-2 text-primary" />
                    SecuGen Hamster Plus Scanner
                  </h5>
                  <Badge bg="success">Demo Mode</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {/* Scanner Visual */}
                <div className="text-center mb-4">
                  <div className="scanner-container position-relative d-inline-block">
                    <div
                      className={`scanner-device border-4 border-primary rounded p-4 bg-white ${
                        scanAnimation ? 'scanning' : ''
                      }`}
                      style={{
                        width: '300px',
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {isScanning ? (
                        <div className="text-center">
                          <div className="scanner-line"></div>
                          <Fingerprint className="text-primary mb-3" size={60} />
                          <h6>Scanning...</h6>
                          <ProgressBar
                            now={scanProgress}
                            className="w-100"
                            variant="primary"
                          />
                          <small className="text-muted mt-2 d-block">
                            {scanProgress}% Complete
                          </small>
                        </div>
                      ) : scanResult ? (
                        <div className="text-center">
                          <CheckCircle className="text-success mb-3" size={60} />
                          <h6 className="text-success">Scan Complete!</h6>
                          <small className="text-muted">
                            Template: {scanResult.template.substring(0, 20)}...
                          </small>
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          <Fingerprint className="mb-3" size={60} opacity={0.3} />
                          <h6>Ready to Scan</h6>
                          <small>Click "Start Scan" to begin</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="text-center mb-4">
                  {!isScanning && !scanResult && (
                    <Button
                      size="lg"
                      onClick={simulateScan}
                      className="px-4"
                    >
                      <PlayCircle className="me-2" size={20} />
                      Start Scan
                    </Button>
                  )}
                  {isScanning && (
                    <Button
                      size="lg"
                      variant="outline-danger"
                      onClick={resetScan}
                      className="px-4"
                    >
                      <PauseCircle className="me-2" size={20} />
                      Cancel Scan
                    </Button>
                  )}
                  {scanResult && (
                    <div>
                      <Button
                        size="lg"
                        variant="success"
                        className="px-4 me-3"
                      >
                        <CheckCircle className="me-2" size={20} />
                        Save Template
                      </Button>
                      <Button
                        size="lg"
                        variant="outline-primary"
                        onClick={resetScan}
                        className="px-4"
                      >
                        <ArrowRepeat className="me-2" size={20} />
                        Scan Again
                      </Button>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    <XCircle className="me-2" size={16} />
                    {error}
                  </Alert>
                )}

                {/* Success Message */}
                {scanResult && scanResult.success && (
                  <Alert variant="success" className="mb-4">
                    <CheckCircle className="me-2" size={16} />
                    {scanResult.message}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Side Panel */}
          <Col lg={4}>
            {/* Process Steps */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <InfoCircle className="me-2 text-primary" />
                  Scanning Process
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <ListGroup variant="flush">
                  {demoSteps.map((step, index) => (
                    <ListGroup.Item
                      key={index}
                      className={`border-0 px-0 ${
                        activeStep === index + 1 ? 'bg-primary bg-opacity-10' : ''
                      }`}
                    >
                      <div className="d-flex align-items-start">
                        <div className={`me-3 ${
                          activeStep === index + 1 ? 'text-primary' : 'text-muted'
                        }`}>
                          {step.icon}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className={`mb-1 ${
                            activeStep === index + 1 ? 'text-primary' : ''
                          }`}>
                            {step.title}
                          </h6>
                          <small className="text-muted">{step.description}</small>
                        </div>
                        {activeStep > index + 1 && (
                          <CheckCircle className="text-success flex-shrink-0" size={16} />
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Quick Tips */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <Speedometer2 className="me-2 text-success" />
                  Quick Tips
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <ul className="mb-0 small">
                  <li className="mb-2">Keep your finger clean and dry</li>
                  <li className="mb-2">Apply gentle, even pressure</li>
                  <li className="mb-2">Hold still during scanning</li>
                  <li>Wait for the green confirmation light</li>
                </ul>
              </Card.Body>
            </Card>

            {/* Tech Specs */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <ShieldCheck className="me-2 text-info" />
                  Scanner Specifications
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Resolution:</span>
                    <span>500 DPI</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Interface:</span>
                    <span>USB 2.0</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Sensor Type:</span>
                    <span>Optical</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Security:</span>
                    <span>Fake Detection</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Troubleshooting Section */}
        <Row className="mt-5">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <Eye className="me-2 text-warning" />
                  Common Issues & Solutions
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-4">
                  {troubleshootingTips.map((tip, index) => (
                    <Col md={6} key={index}>
                      <div className="border rounded p-3">
                        <h6 className="text-danger mb-2">{tip.problem}</h6>
                        <p className="text-muted mb-0">{tip.solution}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* CTA Section */}
        <Row className="mt-5">
          <Col className="text-center">
            <div className="bg-primary bg-opacity-10 rounded p-4">
              <h4 className="mb-3">Ready to Experience Real Biometric Voting?</h4>
              <p className="text-muted mb-4">
                Try our demo or register for a full account to start voting with fingerprint authentication.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button as={Link} to="/signup" variant="primary" size="lg">
                  <Fingerprint className="me-2" size={20} />
                  Register Now
                </Button>
                <Button variant="outline-primary" size="lg" onClick={() => setShowGuide(true)}>
                  <InfoCircle className="me-2" size={20} />
                  Learn More
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* User Guide Modal */}
      <Modal show={showGuide} onHide={() => setShowGuide(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <InfoCircle className="me-2 text-primary" />
            Complete User Guide
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="basics" className="mb-4">
            <Tab eventKey="basics" title="Basics">
              <div className="p-3">
                <h5 className="mb-3">Getting Started</h5>
                <p>
                  Our biometric voting system uses advanced fingerprint recognition to ensure secure
                  and accurate voter identification. Here's everything you need to know.
                </p>
                <h6 className="mt-4 mb-3">Before You Begin</h6>
                <ul>
                  <li>Ensure you have registered your fingerprint in the system</li>
                  <li>Make sure your hands are clean and dry</li>
                  <li>Find a well-lit area for best scanning results</li>
                </ul>
              </div>
            </Tab>
            <Tab eventKey="technique" title="Proper Technique">
              <div className="p-3">
                <h5 className="mb-3">Finger Placement Guide</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6>✅ Do This:</h6>
                    <ul>
                      <li>Use index or middle finger</li>
                      <li>Place finger flat on scanner</li>
                      <li>Apply gentle, even pressure</li>
                      <li>Keep finger steady for 2-3 seconds</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>❌ Avoid This:</h6>
                    <ul>
                      <li>Don't press too hard</li>
                      <li>Don't move finger during scan</li>
                      <li>Don't use wet or oily fingers</li>
                      <li>Don't lift finger prematurely</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Tab>
            <Tab eventKey="security" title="Security">
              <div className="p-3">
                <h5 className="mb-3">Security Features</h5>
                <div className="alert alert-info">
                  <ShieldCheck className="me-2" size={16} />
                  Your fingerprint data is encrypted and stored securely using industry-standard protocols.
                </div>
                <h6>How We Protect Your Data</h6>
                <ul>
                  <li>256-bit encryption for all biometric data</li>
                  <li>Templates stored as mathematical representations</li>
                  <li>Regular security audits and updates</li>
                  <li>Compliance with data protection regulations</li>
                </ul>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => setShowGuide(false)}>
            Close
          </Button>
          <Button variant="primary" as={Link} to="/signup" onClick={() => setShowGuide(false)}>
            Register Account
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom CSS for scanner animation */}
      <style jsx>{`
        .scanner-container {
          perspective: 1000px;
        }

        .scanner-device.scanning {
          animation: pulse 2s infinite;
        }

        .scanner-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #007bff, transparent);
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .hover-lift {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default ScannerDemo;