const Modal = ({fpColor, statusMessage, hasStarted, scan}) => {
  return (
    <div className="modal fade" id="fingerprintModal" tabIndex="-1" aria-labelledby="fingerprintModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-center p-4">
            <div className="modal-header border-0">
            <h5 className="modal-title mx-auto" id="fingerprintModalLabel">Fingerprint Authentication</h5>
            {/* <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
            </div>
            <div className="modal-body">
            <svg style={{"--color":fpColor}} width="800px" height="800px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <title>fingerprint-solid</title>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="invisible_box" data-name="invisible box">
                    <rect width="48" height="48" fill="none"/>
                    </g>
                    <g id="icons_Q2" data-name="icons Q2">
                    <g>
                        <path d="M31.7,37.3V21.9a7.7,7.7,0,0,0-15.4,0V37.3a10.7,10.7,0,0,0,4,8.3,1.8,1.8,0,0,0,.9.4,1.4,1.4,0,0,0,1.2-.6,1.5,1.5,0,0,0-.2-2.2,7.4,7.4,0,0,1-2.8-5.9V21.9a4.6,4.6,0,0,1,9.2,0V37.3a1.5,1.5,0,0,1-1.5,1.5,1.6,1.6,0,0,1-1.6-1.5V21.9a1.5,1.5,0,0,0-3,0V37.6a4.6,4.6,0,0,0,4.6,4.3,4.7,4.7,0,0,0,4.6-4.3Z"/>
                        <path d="M24,8.1A13.8,13.8,0,0,0,10.2,21.9V37.3a17,17,0,0,0,1.9,7.9,1.6,1.6,0,0,0,1.4.8l.7-.2a1.6,1.6,0,0,0,.6-2.1,14.1,14.1,0,0,1-1.6-6.4V21.9a10.8,10.8,0,0,1,21.6,0V37.3a7.9,7.9,0,0,1-2.9,6,1.4,1.4,0,0,0-.2,2.1,1.4,1.4,0,0,0,1.2.6,1.6,1.6,0,0,0,.9-.3,10.6,10.6,0,0,0,4-8.4V21.9A13.8,13.8,0,0,0,24,8.1Z"/>
                        <path d="M24,2A20,20,0,0,0,4,21.9V40.4a1.5,1.5,0,0,0,1.5,1.5,1.6,1.6,0,0,0,1.6-1.5V21.9a16.9,16.9,0,0,1,33.8,0V37.3a12.9,12.9,0,0,1-1.6,6.4,1.5,1.5,0,0,0,.7,2.1l.7.2a1.4,1.4,0,0,0,1.3-.8A16.5,16.5,0,0,0,44,38V21.9A20,20,0,0,0,24,2Z"/>
                    </g>
                    </g>
                </g>
            </svg>
            <p className="mt-3">{statusMessage}</p>
            <div id="statusMessage" className="mt-2 text-muted">{hasStarted? "waiting for fingerprint...":""}</div>
            </div>
            <div className="modal-footer border-0 justify-content-center">
            <button 
                type="button" 
                className="btn btn-primary" 
                id='startFingerprintBtn' 
                onClick={scan}
                disabled={hasStarted? true:false}
            >
                Start
            </button>
            <button type="button" id='closeModal' className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
        </div>
        </div>
    </div>
  )
}

export default Modal
