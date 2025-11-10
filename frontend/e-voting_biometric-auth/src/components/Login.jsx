import {useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Modal from './Others/Modal';
import Prompt from './Prompt';

const Login = () => {
  const [template, setTemplate] = useState();
  const [matched, setMatched] = useState();
  const [step, setStep] = useState(1);
  const [fpColor, setFPColor] = useState("#2e2e2e");
  const [isBiometric, setIsBiometric] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Click start to begin");
  const [prompt, setPrompt] = useState({ id: null, message: "", type: "" });

  const [formData, setFormData] = useState({
    email:'',
    password:'',
    template:''
  });

  const colors = {
    green: "#18ec18",
    blue: "#0ea5e9",
    red: "#fc2e0a",
    black: "#2e2e2e"
  }

  const status = {
    start: "Click start to begin",
    clicked: "Place your finger on the sensor to register fingerprint",
    success: "Fingerprint captured successfully",
    failed: "Failed to capture check your device",
    timeout: "Scanner timeout..."
  }

  const promptMessages = {
    wrongpass: "Incorrect password or email",
    wrongbio: "Fingerprint miss-match",
    success: "Login successful"
  }

  const handleChange = (e)=>{
    setFormData((prev)=>({
      ...prev,
      [e.target.name]:e.target.value
    }));
  }

  const scan = async(e)=>{
    e.preventDefault();
    setFPColor(colors.blue)
    setStatusMessage(status.clicked);
    setHasStarted(true)

    let timeout;
    clearTimeout(timeout)
    try{
      const res = await fetch("http://localhost:8080/api/fingerprint/scan");
      const data = await res.json();
    
      if(data.template == '' || data.template == null){
        setFPColor(colors.red)
        setStatusMessage(status.timeout)
        timeout = setTimeout(()=>{
          setFPColor(colors.black)
          setStatusMessage(status.start)
        }, 1000)
      }else{
        setFormData((prev)=>({
          ...prev,
          "template":data.template
        }));



        setFPColor(colors.green);
        setStatusMessage(status.success)
        
        timeout = setTimeout(()=>{
          document.getElementById('closeModal').click();

          const myModalEl = document.getElementById("fingerprintModal")

          myModalEl.addEventListener('hidden.bs.modal', ()=>{
            setFPColor(colors.black)
            setStatusMessage(status.start)
          })
        }, 1000)
      }
      
    }catch(err){
      setFPColor(colors.red)
      setStatusMessage(status.failed)
      timeout = setTimeout(()=>{
        setFPColor(colors.black)
        setStatusMessage(status.start)
      }, 1000)
      console.warn(err + " Check your connection")
    }
    setHasStarted(false)
  }

  const match = async()=>{
    const encodedTemp1 = encodeURIComponent(formData.template);
    const encodedTemp2 = encodeURIComponent(template);
    const res = await fetch(`http://localhost:8080/api/fingerprint/match?template1=${encodedTemp1}&template2=${encodedTemp2}`);
    const data = await res.json();
    
    setMatched(data.matched)
    if(matched){
      setPrompt({id: Date.now(), message: promptMessages.success, type: "success" });
    }else{
      setPrompt({id: Date.now(), message: promptMessages.wrongbio, type: "error" });
    }
    console.log(data);
  }

  const login = async(e)=>{
    e.preventDefault();
    
    let jsonData = {
      email: formData.email,
      password: formData.password,
      template: formData.template
    }

    if(isBiometric){
      jsonData.password = ""
    }else{
      jsonData.template = ""
    }

    const requestBody = {
      method: 'POST',
      body: JSON.stringify(jsonData)
    }
    const response = await fetch("http://localhost/Projects/biometric-evoting/api/user/login.php", requestBody);
    const data = await response.json();
    console.log(data)
    
    if(data.template)
      setTemplate(data.template)
    if(data.status == false){
      setPrompt({ id: Date.now(), message: promptMessages.wrongpass, type: "error" });
      return;
    }

    console.log(data)

    if(isBiometric){
      match()
    }else{
      setPrompt({ id: Date.now(), message: promptMessages.success, type: "success" });
      // navigate("/dashboard")
    }
  }

  const handleSubmit = (e)=>{
    e.preventDefault();
  }

  const handleNext = ()=>{
    setIsBiometric(true)
    if(step < 2)
      setStep(step + 1)
  }
  const handleBack = ()=>{
    setIsBiometric(false)
    if(step > 1)
      setStep(step - 1)
  }

  return (
    <div className="container my-5">
      <Prompt
        id={prompt.id}
        message={prompt.message}
        type={prompt.type}
        onClose={()=>setPrompt({message:"", type:""})}
      />
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4">
          <div className="card shadow-sm rounded">
            <div className="card-body px-4">
              <h3 className="mb-4 text-center">Sign In</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className='form-label'>
                    Email Address
                  </label>
                  <input 
                    type="email"
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className='form-control'
                    placeholder='example@email.com'
                    required
                  />
                </div>
                {step < 2 && (
                  <div className="mb-3">
                    <label htmlFor="password" className='form-label'>
                      Password
                    </label>
                    <input 
                      type="password"
                      id='password'
                      name='password'
                      className='form-control'
                      placeholder='Enter your password'
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                {step > 1 && (
                  <>
                    <div className='d-flex flex-column'>
                      <input
                        type="text"
                        id='template'
                        name='template'
                        value={formData.template}
                        onChange={handleChange}
                        style={{
                          display:'none'
                        }}
                        required
                      />
                      <button 
                        type='button' 
                        className='mx-auto btn btn-secondary' 
                        data-bs-toggle="modal" 
                        data-bs-target='#fingerprintModal'
                      >
                        {
                          formData.template == ''? ('Scan Fingerprint'):('Capture again')
                        }
                      </button>
                    </div>
                    <Modal fpColor={fpColor} statusMessage={statusMessage} hasStarted={hasStarted} scan={scan}/>
                  </>
                )}

                <div className="my-4 d-flex justify-content-center">
                  {step > 1 && (
                    <button
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleBack}
                    >
                      Use password
                    </button>
                  )}
                  {step < 2 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleNext}
                    >
                      Use biometric
                    </button>
                  )}
                </div>
                
                <button type="submit" className="btn btn-primary w-100" onClick={login}>
                  Sign In
                </button>
                
              </form>
              <p className="mt-3 text-center">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
