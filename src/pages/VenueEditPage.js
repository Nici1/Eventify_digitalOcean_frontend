import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar'; // Import the Calendar component
import '.././calendar.css';

function VenueEditPage() {
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
  const [startTime, setStartTime] = useState(''); // State for start time
  const [endTime, setEndTime] = useState(''); // State for end time
  const [images, setImages] = useState([]); // State for images
  const [warning, setWarning] = useState();
  const [availableDates, setAvailableDates] = useState([]);
  const [partialDates, setPartialDates] = useState([]);
  const [takenDates, setTakenDates] = useState([]);
  const [description, setDescription] = useState(''); // State for description

  useEffect(() => {
    async function getVenueInfo() {
      try {
        const response = await axios.get(`/venue/${bookName.split('-')[0]}`, {
          headers: { 'token': localStorage.getItem('Landlord-Token') },
        });
        console.log("venue info ", response.data.venueData[0].LandlordID);
        setVenueInfo({ ...response.data.venueData[0] });
        setDescription(response.data.venueData[0].Description);

        // Fetch images after venue info is loaded
        fetchImages(response.data.venueData[0].LandlordID);
      } catch (error) {
        console.error('Error fetching venue info:', error);
      }
    }
    getVenueInfo();
  }, [bookName]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
  };

  const fetchImages = async (landlordID) => {
    try {
      console.log("as ", landlordID);
      const response = await axios.post('/venue/getImages', { id: landlordID, venue_id: bookName.split('-')[1] }, {
        headers: {
          'token': localStorage.getItem('Landlord-Token'),
        }
      });
      setImages(response.data);
      console.log("Response ", response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Format selected date to YYYY-MM-DD before saving
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.post(
        '/venue/edit',
        {
          description: description,
          venueID: bookName.split('-')[1],
          date: formattedDate,
          startTime: startTime,
          endTime: endTime,
          token: localStorage.getItem('Landlord-Token'),
        },
        { withCredentials: true }
      );
      setSelectedDate(null);
      setStartTime('');
      setEndTime('');
      console.log('Updated successfully: ', response.data);
    } catch (error) {
      console.error('Error updating: ', error);
    }
  };

  // Fetch available dates when the active month changes
  const handleActiveStartDateChange = async ({ activeStartDate }) => {
    try {
      const response = await axios.post('/venue/availability', {
        id: bookName.split('-')[1],
        date: activeStartDate
      }, {
        headers: { 'token': localStorage.getItem('Landlord-Token') }
      });
      console.log('Response from /venue/availability:', response.data);

      setAvailableDates(response.data.green);
      setPartialDates(response.data.yellow);
      setTakenDates(response.data.red);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  // Initial fetch of available dates
  useEffect(() => {
    const currentDate = new Date();
    handleActiveStartDateChange({ activeStartDate: currentDate });
  }, []);

  return (
    <div className='VenuePage'>
      {venueInfo ? (
        <div>
          <h1 style={{ marginLeft: '15%' }}>{venueInfo.Name}</h1>
          <h3 style={{ marginLeft: '15%' }}>{venueInfo.Address}, {venueInfo.City}</h3>
          <h4 style={{ marginLeft: '15%' }}>Capacity: {venueInfo.Capacity}</h4>

          <div className="image-container">
            {images.length > 0 ? (
              images.map((image, index) => (
                <div className='list-image' key={index}>
                    <img
              src={`data:image/png;base64,${image}`}
              alt={`Image ${index + 1}`}
              className="image-preview"
            />
                </div>
              ))
            ) : (
              <p>No images uploaded</p>
            )}
          </div>
          <div className='description-update'>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" cols="50" />
            </div>
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
          <div className='interval-choice'>
            <div className='time-inputs'>
          <div>
            <label>
              Start Time:
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              End Time:
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>
          </div>
          {warning && <p style={{ color: 'red' }}>{warning}</p>}
          
          <div>
            <button className='venue-element' style={{ backgroundColor: '#484848'}} onClick={handleSave}>Save</button>
          </div>
        </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default VenueEditPage;
