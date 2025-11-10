// src/pages/VotingPage.jsx
import React, { useEffect, useState } from 'react';
import Candidate from './Candidate';
import Modal from './Others/Modal';
import { useParams } from 'react-router-dom';

const VotingPage = () => {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [fpColor, setFPColor] = useState("#2e2e2e");
  const [statusMessage, setStatusMessage] = useState("Click start to vote");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(async() => {
    const res = axios.get(`http://localhost/api/candidates.php?electionId=${electionId}`)
      .then(res => setCandidates(res.data))
      .catch(err => console.error(err));
  }, [electionId]);

  const handleVote = () => {
    if(!selectedCandidate) return;
    const modal = new window.bootstrap.Modal(document.getElementById('fingerprintModal'));
    modal.show();
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Vote for Election #{electionId}</h2>
      <div className="row g-4 mb-4">
        {candidates.map((cand, idx) => (
          <div key={idx} className="col-12 col-md-4">
            <Candidate candidate={cand} isSelected={selectedCandidate?.id === cand.id} onSelect={() => setSelectedCandidate(cand)} isAdmin={false} />
          </div>
        ))}
      </div>
      <div className="text-center">
        <button className="btn btn-primary btn-lg" onClick={handleVote}>Vote Now</button>
      </div>
      <Modal fpColor={fpColor} statusMessage={statusMessage} hasStarted={hasStarted} />
    </div>
  );
};

export default VotingPage;
