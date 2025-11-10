import { Outlet } from 'react-router-dom';
import EnhancedNavbar from '../EnhancedNavbar.jsx';
import { Container } from 'react-bootstrap';

const PublicLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <EnhancedNavbar />
      <main className="flex-grow-1">
        <Container fluid className="p-0">
          <Outlet />
        </Container>
      </main>
      {/* Footer can be added here */}
    </div>
  );
};

export default PublicLayout;