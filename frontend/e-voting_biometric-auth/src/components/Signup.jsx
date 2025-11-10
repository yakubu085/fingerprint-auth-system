import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import Prompt from './Prompt';

import './Signup/Signup.css';
import Modal from './Others/Modal';

const Signup = () => {
  const [template, setTemplate] = useState();
  const [fpColor, setFPColor] = useState("#2e2e2e");
  const [matched, setMatched] = useState();
  const [step, setStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState("Click start to begin");
  const [hasStarted, setHasStarted] = useState(false);
  const [prompt, setPrompt] = useState({ id: null, message: "", type: "" });
  const maxStep = 3;

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
    success: "User registered successfully",
    error: "Something went Wrong"
  }

  const [formData, setFormData] = useState({
    f_name: '',
    l_name:'',
    email:'',
    password:'',
    template:'',
    template2:''
  });

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
        formData.template != '' ? (
          setFormData((prev)=>({
            ...prev,
            "template2":data.template
          }))
        ):(
          setFormData((prev)=>({
            ...prev,
            "template":data.template
          }))
        )

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
    const encodedTemp2 = encodeURIComponent(formData.template2);
    const res = await fetch(`http://localhost:8080/api/fingerprint/match?template1=${encodedTemp1}&template2=${encodedTemp2}`);
    const data = await res.json();
    
    setMatched(data.matched)
    console.log(data);
  }

  const signup = async(e)=>{
    e.preventDefault();

    let jsonData = {
      f_name: formData.f_name,
      l_name: formData.l_name,
      email: formData.email,
      password: formData.password,
      template: formData.template
    }

    const requestBody = {
      method: 'POST',
      body: JSON.stringify(jsonData)
    }

    const response = await fetch("http://localhost/Projects/biometric-evoting/api/user/register.php", requestBody);
    const data = await response.json();
    if(data.success){
      setPrompt({id: Date.now(), message: promptMessages.success, type: "success" });
      setInterval(()=>{
        document.location.href = "/login"
      }, 2000)
    }else{
      setPrompt({id: Date.now(), message: promptMessages.error, type: "error" });
    }
  }

  const handleSubmit = (e)=>{
    e.preventDefault();
    console.log("Hi")
  }

  const handleClear = ()=>{
    console.log("Cleared")
    setMatched(null)

    setFormData((prev)=>({
      ...prev,
      "template":''
    }))
    setFormData((prev)=>({
      ...prev,
      "template2":''
    }));
  }

  const handleNext = ()=>{
    if(step === 1 && (!formData.f_name || !formData.l_name || !formData.email || !formData.password)){
      alert("please fill in all required fields")
      return;
    }
    if(step === 2 && (!formData.template || !formData.template2)){
      alert("please complete adding fingerprints")
      return;
    }else if(step === 2){
      match()
    }

    setStep(step + 1)
  }
  const handleBack = ()=>{
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
            <div className="card-body">
              <h3 className="mb-4 text-center">Create Account</h3>
              <h4 className="mb-4 text-center fs-5">Step {step} of 3</h4>
              <form onSubmit={handleSubmit}>
                {
                  step === 1 && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="f_name" className='form-label'>
                          First Name
                        </label>
                        <input 
                          type="text"
                          id='f_name'
                          name='f_name'
                          className='form-control'
                          placeholder='John Doe'
                          value={formData.f_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="l_name" className='form-label'>
                          Last Name
                        </label>
                        <input 
                          type="text"
                          id='l_name'
                          name='l_name'
                          className='form-control'
                          placeholder='John Doe'
                          value={formData.l_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className='form-label'>
                          Email Address
                        </label>
                        <input 
                          type="email"
                          id='email'
                          name='email'
                          className='form-control'
                          placeholder='example@email.com'
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
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
                    </>
                  )
                }
                {
                  step === 2 && (
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
                          className='mx-auto btn btn-primary' 
                          data-bs-toggle="modal" 
                          data-bs-target='#fingerprintModal'
                          disabled={formData.template2? true:false}
                        >
                          {
                            formData.template == ''? ('Scan Fingerprint'):('Scan again')
                          }
                        </button>
                        {
                          formData.template && (
                            <button 
                              type='button'
                              className="btn btn-outline-secondary btn-sm mt-3 mx-4 py-2"
                              onClick={handleClear}
                            >
                              Clear
                            </button>
                          )
                        }
                      </div>
                      <Modal fpColor={fpColor} statusMessage={statusMessage} hasStarted={hasStarted} scan={scan}/>
                    </>
                  )
                }
                {
                  step === 3 && (
                    <div className='text-center'>
                      {
                        (matched === true || matched === false)?(
                              matched? "Fingerprint matched":"Fingerprint does not match."
                        ):(
                          "Comparing Fingerprint..."
                        )
                      }
                    </div>
                  )
                  
                }
                <div className="my-4 d-flex justify-content-between">
                  {step > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                  )}
                  {step <  3 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary ms-auto"
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  onClick={signup}
                  disabled={
                    (step == maxStep && formData.template != '' && matched !== false)?false:true
                  }
                >
                  Sign Up
                </button>
              </form>
              <p className="mt-3 text-center">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
