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
          '/events',
          {
            pageNumber: pageNumber,
            pageSize: 2,
            token: localStorage.getItem('Spectator-Token'),
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

function EventsPage() {
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
      const book = books.find(book => book.VenueavailabilityID === bookId);

      const payload = {
        performerID: book.PerformerID,
        venueavailabilityID: book.VenueavailabilityID,
      };

      await axios.post('/buyticket', { entry: payload, token: localStorage.getItem('Spectator-Token') });

      setSelectedEntries(prevState => {
        const { [bookId]: _, ...newState } = prevState;
        return newState;
      });
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  return (
    <div className='venue-container'>
      <div className='content-section'>
        {books.map((book, index) => (
          <div key={book.VenueavailabilityID} className='venue-list' ref={index === books.length - 1 ? lastBookElementRef : null}>
            <div className='list-image'>
              {performerImages[index] && <img src={`data:image/png;base64,${performerImages[index]}`} alt={`Performer Image ${book.VenueavailabilityID}`} width="90%" height="100%" />}
            </div>
            <div className='details-section'>
              <h1>{book.PerformerName} at {book.VenueName}</h1>
              <h2>Date and Time: {book.DatesAndTimes}</h2>
              <a href={book.Link} target="_blank" rel="noopener noreferrer">{book.Link}</a>
              <div style={{ marginTop: '1em' }}>Who are we? -  {book.PerformerDescription}</div>
              <div style={{ marginTop: '1em' }}>Where? -  {book.VenueDescription}</div>
            </div>
            <div className='checkbox-section'>
              <div className='list-image-events'>
                {venueImages[index] && <img src={`data:image/png;base64,${venueImages[index]}`} alt={`Venue Image ${book.VenueavailabilityID}`} width="70%" height="90%" />}
              </div>
              <button className='submit-app' onClick={() => handleSubmit(book.VenueavailabilityID)}>Buy Ticket</button>
            </div>
          </div>
        ))}
        {loading && <div>Loading...</div>}
        {error && <div>Error</div>}
      </div>
    </div>
  );
}

export default EventsPage;
