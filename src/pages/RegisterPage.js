import { useState } from 'react';
import { Link, Navigate } from "react-router-dom";

import '../app.css'
import axios from 'axios';




function RegisterPage() {

  const [selectedOption, setSelected_option] = useState('S');
  const [inserted, setInserted] = useState(false);

  const handleOption_change = (event)=>{
    setSelected_option(event.target.value);
    
  }



  const [landlord_info, setlandlord_info] = useState({  
    Name: '',
    Surname: '',
    Address: '',
    DateofBirth: '',
    Email: '',
    Password: '',});


    const [spectator_info, setspectator_info] = useState({  
    Name: '',
    Surname: '',
    Email: '',
    Password: '',});

    const [performer_info, setperformer_info] = useState({  
    Name: '',
    Surname: '',
    Artist: '',
    Description: '',
    Link: '',
    Category: 'Concert',
    Images: [],
    ImagePreviews: [],
    Email: '',
    Password: '',});

  const handleChange = (event)=>{
    const { name, value } = event.target;
    console.log("Event.target: ", name, value)


    switch(selectedOption){

      case 'L':
          setlandlord_info((prevInfo) => ({ ...prevInfo, [name]: value }));
          break;

      case 'P':
          setperformer_info((prevInfo) => ({ ...prevInfo, [name]: value }));
          break;

      case 'S':
          setspectator_info((prevInfo) => ({ ...prevInfo, [name]: value }));
          break;
      default:
          console.log("None of the cases were selected")
          break;

        
        }
  }

  const handleImage = (event) => {
    console.log('Target ', event.target)
    console.log('Files ', event.target.files)
  const { name, value, files } = event.target;
  if (name === 'Images') {
    
    // If the input is a file input, set the files to the state and generate previews
    const imagesArray = Array.from(files);
    setperformer_info((prevInfo) => ({
      ...prevInfo,
      [name]: [...prevInfo[name], ...imagesArray],
      ImagePreviews: [...prevInfo.ImagePreviews, ...imagesArray.map((image) => URL.createObjectURL(image))]
    }));
  } else {
    // For other inputs, update the state normally
    setperformer_info((prevInfo) => ({ ...prevInfo, [name]: value }));
  }
};


  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Performer info", performer_info)    
    const result = await register();

    if (result.data.status === 'success'){
      setInserted(true);
      switch(selectedOption){
      case 'L':
        localStorage.setItem("Landlord-Token", result.data.token)
      case 'P':
        localStorage.setItem("Performer-Token", result.data.token)
      case 'S':
        localStorage.setItem("Spectator-Token", result.data.token)

    }
    }
   
    
  }

  async function register() {
    console.log(selectedOption)
    
    try {
        switch(selectedOption){

            case 'L':
                return await axios.post('/register/Landlord', landlord_info);

            
            case 'P':
        
              try {
                const formData = new FormData();
                // Append other venueInfo fields to formData
                console.log(performer_info)
                Object.entries(performer_info).forEach(([key, value]) => {
                if (key === 'Images') {
                  // Append each image file to formData
                  value.forEach((image, index) => {
                  console.log('hereeee')
                  formData.append('Image', image);
                  });
                }
   
                });
                formData.append('Name', performer_info.Name);
                formData.append('Surname', performer_info.Surname);
                formData.append('Email', performer_info.Email);
                formData.append('Category', performer_info.Category);
                formData.append('Description', performer_info.Description);
                formData.append('Link', performer_info.Link);
                formData.append('Password', performer_info.Password);

                return await axios.post('/register/Performer', formData);

              } catch (error) {
                console.error('Error uploading data:', error);
              }
                
            case 'S':

                return await axios.post('/register/Spectator', spectator_info);

            default: 
                return "None of the options was selected"
        
        }
  } catch (error) {
        console.log(error);
  }
        
        
    
}


  if (inserted){
    switch (selectedOption) {
      case 'L':
        return <Navigate to ={'/venue'}/>
        break;
      case 'P':
        return <Navigate to ={'/venue/list'}/>
        break;
      case 'S':
        return <Navigate to ={'/events'}/>
        break;
      default:
        break;
    }
  }

  return (
  <div className='RegisterPage'>

    <h1>Register</h1>

    <p>Please select the type of user:</p>
    <div className='User-Selector'>

      <div className='selector-input'>
        <input type="radio" id="Landlord" name="user" value='L'  checked={selectedOption === 'L'} onChange={handleOption_change}/>
        <label htmlFor="Landlord">Landlord</label>
      </div>
      <div className='selector-input'>
        <input type="radio" id="Performer" name="user" value='P'  checked={selectedOption === 'P'} onChange={handleOption_change}/>
        <label htmlFor="Performer">Performer</label>
      </div>
      <div className='selector-input'>
        <input type="radio" id="Spectator" name="user" value='S'  checked={selectedOption === 'S'} onChange={handleOption_change}/>
        <label htmlFor="Spectator">Spectator</label>
      </div>
    </div>

    {
  (() => {
    switch (selectedOption) {
      case 'L':
        return (
          <form className='Form'>
            <input className='register-element' type="text" placeholder='Name' name='Name' value={landlord_info.Name} onChange={handleChange} />
            <input className='register-element' type="text" placeholder="Surname" name='Surname' value={landlord_info.Surname} onChange={handleChange} />
            <input className='register-element' type="text" placeholder="Address" name='Address' value={landlord_info.Address} onChange={handleChange} />
            <input className='register-element' type="date" placeholder="Date of birth" name='DateofBirth' value={landlord_info.DateofBirth} onChange={handleChange} />
            <input className='register-element' type="email" placeholder="your@email.com" name='Email' value={landlord_info.Email} onChange={handleChange} />
            <input className='register-element' type="password" placeholder="Password" name='Password' value={landlord_info.Password} onChange={handleChange} />
            <button className='register-element' type="submit" onClick={handleSubmit}>Register</button>
          </form>
        );
      case 'S':
        return(
          <form className='Form'>
            <input className='register-element' type="text" placeholder='Name' name='Name' value={spectator_info.Name} onChange={handleChange} />
            <input className='register-element' type="text" placeholder="Surname" name='Surname' value={spectator_info.Surname} onChange={handleChange} />
            <input className='register-element' type="email" placeholder="your@email.com" name='Email' value={spectator_info.Email} onChange={handleChange} />
            <input className='register-element' type="password" placeholder="Password" name='Password' value={spectator_info.Password} onChange={handleChange} />
            <button className='register-element' type="submit" onClick={handleSubmit}>Register</button>
          </form>
        );
        case 'P':
        return(
          <form className='Form'>
            <input className='register-element' type="text" placeholder='Name' name='Name' value={performer_info.Name} onChange={handleChange} />
            <input className='register-element' type="text" placeholder="Surname" name='Surname' value={performer_info.Surname} onChange={handleChange} />
            <input className='register-element' type="email" placeholder="your@email.com" name='Email' value={performer_info.Email} onChange={handleChange} />
            <select className='register-element' name='Category' value={performer_info.Category} onChange={handleChange}>
              <option>Concert</option>
              <option>Theatre</option>
              <option>Film</option>
              <option>Sports</option>
              <option>Art Exhibition</option>
              <option>Conference</option>
              <option>Party</option>
              <option>Fitness</option>
            </select>
            <label className='image-uploader'>
          <input type="file" className="hidden" name="Images" onChange={handleImage} multiple style={{ display: 'none' }} />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </label>
        <div className="image-previews">
          {performer_info.ImagePreviews.length > 0 ? (
            performer_info.ImagePreviews.map((preview, index) => {
              // Calculate aspect ratio of the image
              const aspectRatio = performer_info.Images[index].width / performer_info.Images[index].height;
              // Set the width and height of the image preview container based on the aspect ratio
              const width = aspectRatio > 1 ? '200px' : 'auto';
              const height = aspectRatio > 1 ? 'auto' : '200px';

              return (
                <div className="image-preview" key={index} style={{ width: width, height: height }}>
                  <img className="preview-image" src={preview} alt={`Preview ${index + 1}`} />
                </div>
              );
            })
          ) : (
            <p>No images uploaded</p>
          )}
        </div>
            
            <input className='register-element' type="text" placeholder="Artist" name='Artist' value={performer_info.Artist} onChange={handleChange} />
            <textarea className='register-element description-input' type="text" placeholder="Description" name='Description' value={performer_info.Description} onChange={handleChange} />
            <input className='register-element' type="text" placeholder="Link" name='Link' value={performer_info.Link} onChange={handleChange} />
            <input className='register-element' type="password" placeholder="Password" name='Password' value={performer_info.Password} onChange={handleChange} />
            <button className='register-element' type="submit" onClick={handleSubmit}>Register</button>
          </form>
        )
      // Add other cases for different options if needed
      default:
        return null;
    }
  })()
}
    
    
  </div>
  );
}

export default RegisterPage;
