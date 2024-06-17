import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar'; // Import the Calendar component
import '.././calendar.css';

function VenueDetailPage() {
  const [venueInfo, setVenueInfo] = useState({
    Name: '',
    Capacity: 0,
    Address: '',
    Description: '',
    City: '',
    LandlordID: 1
  });
  const { bookName } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(''); // State for selected time
  const [availableTime, setAvailableTime] = useState(); // State for selected time
  const [images, setImages] = useState([]); // State for images
  const [warning, setWarning] = useState();
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [partialDates, setPartialDates] = useState([]);
  const [takenDates, setTakenDates] = useState([]);


  const handleDateChange = async (date) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
    console.log(bookName.split('-')[1]);
    
    try {
      // Send selected date to the backend
      const response = await axios.post('/venue/Date', { date: date, id: bookName.split('-')[1] }, {
        headers: {
          'token': localStorage.getItem('Performer-Token'),
        },
      });
      console.log('Date sent from backend:', response.data);
      setAvailableTime(response.data);
    } catch (error) {
      console.error('Error sending date to backend:', error);
    }
  };

  useEffect(() => {
    async function getVenueInfo() {
      try {
        const response = await axios.get(`/venue/${bookName.split('-')[0]}`, {
          headers: { 'token': localStorage.getItem('Performer-Token') },
        });
        console.log("venue info ", response.data.venueData[0].LandlordID)
        setVenueInfo({ ...response.data.venueData[0] });

        // Fetch images after venue info is loaded
        fetchImages(response.data.venueData[0].LandlordID);
      } catch (error) {
        console.error('Error fetching venue info:', error);
      }
    }
    getVenueInfo();
    


  }, [bookName]);

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const fetchImages = async (landlordID) => {
    try {
      console.log("as ", landlordID)
      const response = await axios.post('/venue/getImages', { id: landlordID, venue_id: bookName.split('-')[1] }, {
        headers: {
          'token': localStorage.getItem('Performer-Token'),
        }
      });
      setImages(response.data);
      console.log("Response ", response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleSubmit = async () => {
    if (selectedTime === '') {
      setWarning('No time interval was selected')
    }
    else{
    try {
      setWarning('Okay')
      // Send selected time interval to the backend
      const response = await axios.post('/apply', {
        selectedTime: selectedTime,
      }, {
          headers: { 'token': localStorage.getItem('Performer-Token') },
        });
      console.log('Response from submit:', response.data);
      // Optionally, reset the selected time after successful submission
      setSelectedTime('');
    } catch (error) {
      console.error('Error submitting time interval:', error);
    }
  }
  };

  // Function to handle the month change in the calendar
  const handleActiveStartDateChange = async ({ activeStartDate }) => {
    try {
      const response = await axios.post('/venue/availability', {
        id: bookName.split('-')[1],
        date: activeStartDate
      }, {
        headers: { 'token': localStorage.getItem('Performer-Token') }
      });
      console.log('Response from /venue/availability:', response.data);

      setAvailableDates(response.data.green);
      setPartialDates(response.data.yellow);
      setTakenDates(response.data.red);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };


    useEffect(() => {
    // Get the current date
    const currentDate = new Date();
    console.log('current date ', currentDate)
    // Call the handleActiveStartDateChange function with the current date
    handleActiveStartDateChange({ activeStartDate: currentDate });
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  console.log(bookName)

  return (
    <div className='VenuePage'>
      {venueInfo ? (
        <div>
          <h1 style={{ marginLeft: '20%' }}>{venueInfo.Name}</h1>
          <h3 style={{ marginLeft: '20%' }}>{venueInfo.Address}, {venueInfo.City}</h3>
          <h4 style={{ marginLeft: '20%' }}>Capacity: {venueInfo.Capacity}</h4>
          
          <div className="image-container">
            {images.length > 0 ? (
              images.map((image, index) => (
                <div className="image-preview" key={index}>
                  <img className="preview-image" src={`data:image/png;base64,${image}`} alt={`Preview ${index + 1}`}  width="100%" height="100%"/>
                </div>
              ))
            ) : (
              <p>No images uploaded</p>
            )}
          </div>
            <p>{venueInfo.Description}</p>
            <div className='calendar-container'>
              <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              onActiveStartDateChange={handleActiveStartDateChange}
              className='custom-calendar'
              tileClassName={({ date }) => {
                const formattedDate = date.toISOString().split('T')[0];
                if (selectedDate && formattedDate === selectedDate.toISOString().split('T')[0]) {
                  return 'blue-tile'; // Apply blue color class to selected date
                } else if (availableDates.includes(formattedDate)) {
                  return 'green-tile'; // Apply green color class to dates with all available times
                } else if (partialDates.includes(formattedDate)) {
                  return 'orange-tile'; // Apply yellow color class to dates with some available and some taken times
                } else if (takenDates.includes(formattedDate)) {
                  return 'red-tile'; // Apply red color class to dates with all taken times
                }
                return ''; // Default class
              }}
            />
            
       
          </div>
          <select value={selectedTime} onChange={handleTimeChange}>
            <option value="">Select Time</option>
            {availableTime?.map((c, index) => (<option key={index} value={c.ID}>{c.StartTime + '-' + c.EndTime}</option>))}
          </select>
          {warning !== 'Okay' && !selectedTime && <p style={{ color: 'red' }}>No time interval was selected</p>}
          <div>
            <button className='venue-element' style={{ backgroundColor: 'gray' }} onClick={handleSubmit}>Submit</button>
          </div>  
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default VenueDetailPage;












