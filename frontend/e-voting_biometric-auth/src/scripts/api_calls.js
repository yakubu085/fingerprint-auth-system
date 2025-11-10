const signup = async(e)=>{
    e.preventDefault();

    const form = document.querySelector("form");
    const formData = new FormData(form);
    let jsonData = {};
    formData.forEach((value, key)=>{
      jsonData[key] = value;
    })

    const requestBody = {
      method: 'POST',
      body: JSON.stringify(jsonData)
    }

    const response = await fetch("http://localhost/Projects/biometric-evoting/api/user/register.php", requestBody);
    const data = await response.json();
    console.log(data);
}

const login = async(e)=>{
    e.preventDefault();

    const form = document.querySelector("form");
    const formData = new FormData(form);
    let jsonData = {};
    formData.forEach((value, key)=>{
      jsonData[key] = value;
    })

    const requestBody = {
      method: 'POST',
      body: JSON.stringify(jsonData)
    }

    const response = await fetch("http://localhost/Projects/biometric-evoting/api/user/login.php", requestBody);
    const data = await response.json();
    setTemplate2(data.template)
    console.log(data);

    match();
}

const scan = async(e)=>{
    e.preventDefault();

    const res = await fetch("http://localhost:8080/api/fingerprint/scan");
    const data = await res.json();
    console.log(data)

    setFormData((prev)=>({
      ...prev,
      "template":data.template
    }));
}

const match = async(e)=>{
    e.preventDefault();

    const res = await fetch("http://localhost:8080/api/fingerprint/match");
    const data = await res.json();
    console.log(data)
}

export default {signup, login, scan, match}