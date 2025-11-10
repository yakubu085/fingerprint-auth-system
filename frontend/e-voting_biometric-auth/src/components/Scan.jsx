import { Button } from 'bootstrap'
import React, { useState } from 'react'
import './Scan.css'

const Scan = () => {
  const [template, setTemplate] = useState('');
  const [matched, setMatched] = useState();

  const scanfingerprint = async()=>{
    const res = await fetch("http://localhost:8080/api/fingerprint/scan");
    const data = await res.json();
  
    setTemplate(data.template);
    console.log(data);
    console.log(template.length)
  }
  const matchfingerprint = async()=>{
    const encodedTemp = encodeURIComponent(template);
    const res = await fetch(`http://localhost:8080/api/fingerprint/match?template1=${encodedTemp}&template2=${encodedTemp}`);
    const data = await res.json();
    
    setMatched(data.matched)
    console.log(matched);
  }

  return (
    <div className='scan'>
      <button onClick={scanfingerprint} value="Click to scan">Click to scan</button>
      <button onClick={matchfingerprint} value="Click to scan">Click to match</button>
    </div>
  )
}

export default Scan
