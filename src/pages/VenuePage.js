import { useState } from 'react';
import axios from 'axios';

function VenuePage() {
  const [venueInfo, setVenueInfo] = useState({
    Name: '',
    Capacity: 15,
    Address: '',
    City: '',
    Description: '',
    Category: 'Concert',
    Images: [], // Initialize Images to an empty array
    ImagePreviews: [] // Initialize ImagePreviews to an empty array
  });

  const handleChange = (event) => {
    console.log('Target ', event.target)
    console.log('Files ', event.target.files)
  const { name, value, files } = event.target;
  if (name === 'Images') {
    
    // If the input is a file input, set the files to the state and generate previews
    const imagesArray = Array.from(files);
    setVenueInfo((prevInfo) => ({
      ...prevInfo,
      [name]: [...prevInfo[name], ...imagesArray],
      ImagePreviews: [...prevInfo.ImagePreviews, ...imagesArray.map((image) => URL.createObjectURL(image))]
    }));
  } else {
    // For other inputs, update the state normally
    setVenueInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  }
};


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const result = await postVenueInfo();
      console.log(result);
      alert('Submission successful');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  async function postVenueInfo() {
    try {
      const formData = new FormData();
      // Append other venueInfo fields to formData
      console.log(venueInfo)
      Object.entries(venueInfo).forEach(([key, value]) => {
        if (key === 'Images') {
          // Append each image file to formData
          value.forEach((image, index) => {
            console.log('hereeee')
            formData.append('Image', image);
          });
        }
   
      });
      formData.append('Name', venueInfo.Name);
      formData.append('Capacity', venueInfo.Capacity);
      formData.append('Address', venueInfo.Address);
      formData.append('City', venueInfo.City);
      formData.append('Description', venueInfo.Description);
      formData.append('Category', venueInfo.Category);

      for (const value of formData.values()) {
      console.log("Brateeee", value);
}
      const response = await axios.post('/venue', formData, {
        headers: {
          'token': localStorage.getItem('Landlord-Token'),
        },
      });

      console.log('Upload success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  }

  // Log the venueInfo state for debugging purposes
  console.log('Current venueInfo state:', venueInfo);

  return (
    <div className='VenuePage'>
      <h1>Venue</h1>
      <form className='Form'>
        <input className='venue-element' type="text" placeholder="Name" name='Name' value={venueInfo.Name} onChange={handleChange} />
        <input className='venue-element' type="text" placeholder="Address" name='Address' value={venueInfo.Address} onChange={handleChange} />
        <input className='venue-element' type="text" placeholder="City" name='City' value={venueInfo.City} onChange={handleChange} />
        <input className='venue-element' type="number" placeholder="Capacity" name='Capacity' value={venueInfo.Capacity} onChange={handleChange} />
        <textarea className='venue-element description-input' type="text" placeholder="Description" name='Description' value={venueInfo.Description} onChange={handleChange} />

        <select className='venue-element' name='Category' value={venueInfo.Category} onChange={handleChange}>
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
          <input type="file" className="hidden" name="Images" onChange={handleChange} multiple style={{ display: 'none' }} />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </label>
        <div className="image-previews">
  {venueInfo.ImagePreviews.length > 0 ? (
    venueInfo.ImagePreviews.map((preview, index) => {
      // Calculate aspect ratio of the image
      const aspectRatio = venueInfo.Images[index].width / venueInfo.Images[index].height;
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


        <button className='venue-element' type="submit" onClick={handleSubmit}>Submit</button>
      </form>
    </div>
  );
}

export default VenuePage;





 


