import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Carousel,
  Modal,
  Tab,
  Tabs
} from 'react-bootstrap';
import {
  ShieldCheck,
  Speedometer2,
  Fingerprint,
  Eye,
  CheckCircle,
  Clock,
  Users,
  Award,
  ChevronRight,
  PlayCircle,
  ArrowRight,
  PersonCheck
} from 'react-bootstrap-icons';
import FeatureCard from './Home/FeatureCard';
import NewsCard from './Home/NewsCard';

const EnhancedHomepage = () => {
  const [showScannerDemo, setShowScannerDemo] = useState(false);
  const [activeElections, setActiveElections] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);

  // Simulate real-time statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElections(prev => prev + Math.floor(Math.random() * 3));
      setTotalVoters(prev => prev + Math.floor(Math.random() * 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const news = [
    {
      title: "SUG Elections Coming Soon",
      content: "Prepare to cast your vote and make your voice heard! Registration opens next week.",
      date: "Nov 1, 2025",
      type: "announcement",
      badge: "Important"
    },
    {
      title: "New Biometric Scanner Deployment",
      content: "SecuGen Hamster Plus scanners are now available at all voting centers.",
      date: "Oct 25, 2025",
      type: "technology",
      badge: "New"
    },
    {
      title: "Security Update Complete",
      content: "Enhanced fingerprint matching algorithms deployed for improved accuracy.",
      date: "Oct 20, 2025",
      type: "security",
      badge: "Update"
    },
  ];

  const features = [
    {
      icon: <ShieldCheck className="text-primary" size={32} />,
      title: "Biometric Security",
      desc: "SecuGen fingerprint authentication eliminates fraud and ensures one person, one vote."
    },
    {
      icon: <Speedometer2 className="text-success" size={32} />,
      title: "Lightning Fast",
      desc: "Complete voting process in under 30 seconds with instant confirmation."
    },
    {
      icon: <Fingerprint className="text-info" size={32} />,
      title: "Touch & Vote",
      desc: "Simple fingerprint scan is all you need - no passwords, no paperwork."
    },
    {
      icon: <Eye className="text-warning" size={32} />,
      title: "Complete Transparency",
      desc: "Real-time results tracking and full audit trail for every vote cast."
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Register",
      description: "Create your account and register your fingerprint with our secure system.",
      icon: <PersonCheck size={24} />
    },
    {
      step: 2,
      title: "Scan",
      description: "Place your finger on the SecuGen Hamster Plus scanner for instant verification.",
      icon: <Fingerprint size={24} />
    },
    {
      step: 3,
      title: "Verify",
      description: "System matches your fingerprint with registered template securely.",
      icon: <ShieldCheck size={24} />
    },
    {
      step: 4,
      title: "Vote",
      description: "Select your candidate and confirm your vote. Receipt generated instantly.",
      icon: <CheckCircle size={24} />
    }
  ];

  const scannerFeatures = [
    "USB 2.0 High-Speed Interface",
    "Advanced Optical Fingerprint Sensor",
    "500 DPI High-Resolution Imaging",
    "Fake Finger Detection Technology",
    "Cross-Platform Compatibility",
    "Compact and Portable Design"
  ];

  return (
    <div>
      {/* Enhanced Hero Section */}
      <section className="hero-section text-white d-flex align-items-center position-relative"
               style={{
                 backgroundImage: 'linear-gradient(135deg, rgba(26,61,124,0.9) 0%, rgba(0,191,255,0.8) 100%), url(https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1470&q=80)',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: '100vh'
               }}>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="text-center text-lg-start">
              <Badge bg="warning" text="dark" className="mb-3">
                <ShieldCheck className="me-1" size={16} />
                Secured by Biometric Technology
              </Badge>
              <h1 className="display-3 fw-bold mb-4">
                Secure Elections Through<br />
                <span className="text-info">Fingerprint Technology</span>
              </h1>
              <p className="lead mb-4">
                Experience the future of democratic voting with our advanced biometric authentication system.
                Your fingerprint is your vote - secure, fast, and completely transparent.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Button as={Link} to="/login" size="lg" className="px-4 py-3">
                  <Fingerprint className="me-2" size={20} />
                  Start Voting Now
                </Button>
                <Button variant="outline-light" size="lg" className="px-4 py-3" onClick={() => setShowScannerDemo(true)}>
                  <PlayCircle className="me-2" size={20} />
                  See How It Works
                </Button>
              </div>
            </Col>
            <Col lg={6} className="mt-5 mt-lg-0">
              {/* Real-time Statistics */}
              <div className="row g-3">
                <Col sm={6}>
                  <Card className="bg-white bg-opacity-10 border-white text-white">
                    <Card.Body className="text-center">
                      <Users className="mb-2" size={32} />
                      <h3 className="mb-1">{totalVoters.toLocaleString()}</h3>
                      <p className="mb-0 small">Registered Voters</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="bg-white bg-opacity-10 border-white text-white">
                    <Card.Body className="text-center">
                      <Clock className="mb-2" size={32} />
                      <h3 className="mb-1">{activeElections}</h3>
                      <p className="mb-0 small">Active Elections</p>
                    </Card.Body>
                  </Card>
                </Col>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Biometric Security Benefits Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <Badge bg="primary" className="mb-3">Why Choose Biometric Voting?</Badge>
              <h2 className="display-5 fw-bold mb-3">Unmatched Security & Convenience</h2>
              <p className="lead text-muted">
                Traditional voting methods are prone to fraud and inefficiency. Our biometric system ensures
                complete integrity while making voting easier than ever before.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3}>
                <FeatureCard icon={feature.icon} title={feature.title} desc={feature.desc} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <Badge bg="success" className="mb-3">Simple Process</Badge>
              <h2 className="display-5 fw-bold mb-3">How Biometric Voting Works</h2>
              <p className="lead text-muted">
                Four simple steps to cast your vote securely and efficiently
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {howItWorks.map((step) => (
              <Col key={step.step} md={6} lg={3}>
                <Card className="h-100 border-0 shadow-sm hover-lift">
                  <Card.Body className="text-center p-4">
                    <div className="mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                           style={{ width: '60px', height: '60px' }}>
                        {step.icon}
                      </div>
                    </div>
                    <Badge bg="primary" className="mb-2">Step {step.step}</Badge>
                    <Card.Title className="h5 mb-3">{step.title}</Card.Title>
                    <Card.Text className="text-muted">{step.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* SecuGen Scanner Showcase */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <Badge bg="light" text="primary" className="mb-3">Technology Partner</Badge>
              <h2 className="display-5 fw-bold mb-4">SecuGen Hamster Plus Scanner</h2>
              <p className="lead mb-4">
                We use industry-leading SecuGen fingerprint scanners for maximum accuracy and reliability.
                Trusted by governments and organizations worldwide for secure identity verification.
              </p>
              <Row className="g-3">
                {scannerFeatures.map((feature, index) => (
                  <Col sm={6} key={index}>
                    <div className="d-flex align-items-center">
                      <CheckCircle className="text-info me-2 flex-shrink-0" size={16} />
                      <small>{feature}</small>
                    </div>
                  </Col>
                ))}
              </Row>
              <Button variant="outline-light" className="mt-4" onClick={() => setShowScannerDemo(true)}>
                <PlayCircle className="me-2" size={16} />
                Watch Demo
              </Button>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <img
                  src="https://via.placeholder.com/500x400/0056b3/ffffff?text=SecuGen+Hamster+Plus+Scanner"
                  alt="SecuGen Scanner"
                  className="img-fluid rounded shadow-lg"
                />
                <Badge bg="info" className="mt-3">Industry Standard</Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Trust & Security Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <Badge bg="success" className="mb-3">Certified & Secure</Badge>
              <h2 className="display-5 fw-bold mb-3">Enterprise-Grade Security</h2>
              <p className="lead text-muted">
                Your biometric data is encrypted and protected with industry-leading security measures
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <ShieldCheck className="text-primary mb-3" size={48} />
                  <Card.Title>256-bit Encryption</Card.Title>
                  <Card.Text className="text-muted">
                    Military-grade encryption protects all fingerprint data during transmission and storage
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <Eye className="text-success mb-3" size={48} />
                  <Card.Title>Full Audit Trail</Card.Title>
                  <Card.Text className="text-muted">
                    Every action is logged and tracked for complete transparency and accountability
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <Award className="text-warning mb-3" size={48} />
                  <Card.Title>Certified Compliant</Card.Title>
                  <Card.Text className="text-muted">
                    Meets international standards for biometric security and data protection
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* News & Updates Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <Badge bg="info" className="mb-3">Stay Updated</Badge>
              <h2 className="display-5 fw-bold mb-3">Latest News & Updates</h2>
              <p className="lead text-muted">
                Keep informed about the latest developments in our biometric voting system
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {news.map((item, index) => (
              <Col key={index} md={4}>
                <NewsCard title={item.title} content={item.content} date={item.date} badge={item.badge} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-5 text-center" style={{ background: 'linear-gradient(135deg, #1A3D7C 0%, #00BFFF 100%)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Badge bg="warning" text="dark" className="mb-3">Ready to Vote?</Badge>
              <h2 className="display-4 fw-bold text-white mb-4">
                Join the Future of Secure Voting
              </h2>
              <p className="lead text-white-50 mb-4">
                Experience the most secure, efficient, and transparent voting system available.
                Your fingerprint is your key to democracy.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Button as={Link} to="/signup" size="lg" variant="light" className="px-4 py-3">
                  <PersonCheck className="me-2" size={20} />
                  Register Now
                </Button>
                <Button variant="outline-light" size="lg" className="px-4 py-3" onClick={() => setShowScannerDemo(true)}>
                  <PlayCircle className="me-2" size={20} />
                  Watch Demo
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Scanner Demo Modal */}
      <Modal show={showScannerDemo} onHide={() => setShowScannerDemo(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Fingerprint className="me-2 text-primary" />
            Biometric Scanner Demo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="demo" className="mb-4">
            <Tab eventKey="demo" title="Interactive Demo">
              <div className="text-center p-4">
                <div className="mb-4">
                  <img
                    src="https://via.placeholder.com/400x300/0056b3/ffffff?text=Interactive+Scanner+Demo"
                    alt="Scanner Demo"
                    className="img-fluid rounded"
                  />
                </div>
                <p className="text-muted">
                  Experience the fingerprint scanning process in this interactive demonstration.
                  Learn proper finger placement and see how the system verifies your identity.
                </p>
                <Button variant="primary" as={Link} to="/scanner-demo">
                  Launch Full Demo <ChevronRight className="ms-1" size={16} />
                </Button>
              </div>
            </Tab>
            <Tab eventKey="guide" title="User Guide">
              <div className="p-4">
                <h5 className="mb-3">Quick Start Guide</h5>
                <ol>
                  <li className="mb-2">Clean your hands and ensure fingers are dry</li>
                  <li className="mb-2">Place your index finger flat on the scanner</li>
                  <li className="mb-2">Apply gentle, even pressure</li>
                  <li className="mb-2">Wait for the green verification light</li>
                  <li className="mb-2">Remove finger when prompted</li>
                </ol>
                <div className="alert alert-info">
                  <strong>Pro Tip:</strong> For best results, avoid excessive pressure and ensure
                  full finger contact with the scanner surface.
                </div>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => setShowScannerDemo(false)}>
            Close
          </Button>
          <Button variant="primary" as={Link} to="/signup" onClick={() => setShowScannerDemo(false)}>
            Register Now <ArrowRight className="ms-1" size={16} />
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EnhancedHomepage;
