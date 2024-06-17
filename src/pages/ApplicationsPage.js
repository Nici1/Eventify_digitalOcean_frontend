import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

function useBookSearch(pageNumber) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [books, setBooks] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [venueImages, setVenueImages] = useState([]);
  const [performerImages, setPerformerImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await axios.post(
          '/application',
          {
            pageNumber: pageNumber,
            pageSize: 2,
            token: localStorage.getItem('Landlord-Token'),
          },
          { withCredentials: true }
        );
        const { result, venue_images, performer_images } = response.data;

        setBooks(prevBooks => [...prevBooks, ...result]);
        setHasMore(result.length > 0);

        setVenueImages(prevImages => {
          if (pageNumber === 1) {
            return venue_images;
          } else {
            return [...prevImages, ...venue_images];
          }
        });

        setPerformerImages(prevImages => {
          if (pageNumber === 1) {
            return performer_images;
          } else {
            return [...prevImages, ...performer_images];
          }
        });
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageNumber]);

  useEffect(() => {
    setBooks([]);
  }, []);

  return { loading, error, books, hasMore, venueImages, performerImages };
}

function ApplicationsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState({});

  const {
    books,
    hasMore,
    loading,
    error,
    venueImages,
    performerImages
  } = useBookSearch(pageNumber);

  const observer = useRef();

  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && node === entries[0].target) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });

      if (node) observer.current.observe(node);

      return () => {
        if (node) observer.current.unobserve(node);
      };
    },
    [loading, hasMore]
  );

  const handleEntrySelection = (bookId, dateTime) => {
    setSelectedEntries(prevState => ({
      ...prevState,
      [bookId]: prevState[bookId] === dateTime ? null : dateTime,
    }));
  };

  const handleSubmit = async (bookId) => {
    try {
      const entry = selectedEntries[bookId];
      const book = books.find(book => book.VenueavailabilityID === bookId);

      if (!entry) {
        console.log('Please select a date and time before submitting.');
        return;
      }

      const payload = {
        performerName: book.PerformerName,
        venueName: book.VenueName,
        dateTime: entry,
        performerID: book.PerformerID,
        venueavailabilityID: book.VenueavailabilityID,
      };

      await axios.post('/verdict', { entry: payload, token: localStorage.getItem('Landlord-Token') });

      setSelectedEntries(prevState => {
        const { [bookId]: _, ...newState } = prevState;
        return newState;
      });
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  // Group entries by PerformerID and VenueID
  const groupedEntries = books.reduce((acc, book, index) => {
    const key = `${book.PerformerID}-${book.VenueID}`;
    if (!acc[key]) {
      acc[key] = {
        book,
        dateTimes: [],
        venueImage: venueImages[index],
        performerImage: performerImages[index]
      };
    }
    acc[key].dateTimes.push(book.DatesAndTimes);
    return acc;
  }, {});

  return (
  <div className='venue-container'>
    <div className='content-section'>
      {Object.entries(groupedEntries).map(([key, group], index) => (
        <div key={group.book.VenueavailabilityID} className='venue-list' ref={index === Object.keys(groupedEntries).length - 1 ? lastBookElementRef : null}>
          <div className='list-image'>
            {group.performerImage && <img src={`data:image/png;base64,${group.performerImage}`} alt={`Image ${group.book.VenueavailabilityID}`} width="90%" height="100%" />}
          </div>
          <div className='details-section'>
            <h1>{group.book.VenueName} - {group.book.PerformerName}</h1>
            <a href={group.book.Link} target="_blank" rel="noopener noreferrer">{group.book.Link}</a>
            <div style={{ marginTop: '1em' }}>{group.book.Description}</div>
          </div>
          <div className='checkbox-section'>
            {group.dateTimes.map((dateTime, i) => (
              <div key={i} className="time-slot">
                <div>{dateTime}</div>
                <div>
                  <input
                    type="checkbox"
                    checked={selectedEntries[group.book.VenueavailabilityID] === dateTime}
                    onChange={() => handleEntrySelection(group.book.VenueavailabilityID, dateTime)}
                  />
                </div>
              </div>
            ))}
            <button className = 'submit-app' onClick={() => handleSubmit(group.book.VenueavailabilityID)}>Submit</button>
          </div>
        </div>
      ))}
      {loading && <div>Loading...</div>}
      {error && <div>Error</div>}
    </div>
  </div>
);


}

export default ApplicationsPage;
