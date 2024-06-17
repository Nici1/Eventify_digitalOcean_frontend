import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function useBookSearch(pageNumber, selectedCity) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [books, setBooks] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [images, setImages] = useState([]);


  useEffect(() => {
    console.log('i fire once');
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      if (pageNumber === 1) {
        setBooks([]);
        setImages([]);
        setHasMore(true);
      }

      try {
        const response = await axios.post(
          '/venue/list',
          {
            pageNumber: pageNumber,
            pageSize: 2,
            City: selectedCity,
            token: localStorage.getItem('Performer-Token'),
          },
          { withCredentials: true }
        );
        console.log(response)
        setBooks(prevBooks => {
          if (pageNumber === 1) {
            return response.data.result;
          } else {
            return [...prevBooks, ...response.data.result];
          }
        });

        
        setImages(prevImages => {
          if (pageNumber === 1) {
            return response.data.images;
          } else {
            return [...prevImages, ...response.data.images];
          }
        });
        
        setHasMore(response.data.result.length > 0);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();


    
  }, [pageNumber, selectedCity]);

  

  return { loading, error, books, hasMore, images 
  };
}

function VenueListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedCity, setSelectedCity] = useState('All');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesData = await axios.post('/venue/list/city', { token: localStorage.getItem("Performer-Token") }, { withCredentials: true });
        setCities(citiesData.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCities();
  }, []);

  
  const {
    books,
    hasMore,
    loading,
    error,
    images
  } = useBookSearch(pageNumber, 
    selectedCity
  );

  const observer = useRef();

  
  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber(prevPageNumber => prevPageNumber + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  
  
  const handleCityChange = (value) => {
    setSelectedCity(value);
    setPageNumber(1);  // Reset page number when city changes
  };

    console.log('Books ', books)
  return (
    
    <div className='venue-container'>
      
      <div className='Filter-wrapper'>
        <div className='Filter'>
          <div>Filter by city:</div>
          <select className='venue-element' value={selectedCity} onChange={(e) => handleCityChange(e.target.value)}>
            <option value="All">All</option> {/* Add the 'All' option here */}
            {cities.map((c, index) => (
              <option key={index} value={c.City}>{c.City}</option>
            ))}
          </select>
          </div>
      </div>


      
      <div className='content-section'>
        {books.map((book, index) => {
          const key = `${book.ID}-${index}`;
          const imageIndex = book.ID - 1;
          const image = images[index];

          if (books.length === index + 1) {
            return <Link to={`/venue/${book.Name}-${book.ID}`} key={key} className="custom-link">
              <div className='venue-list' ref={lastBookElementRef} key={key}>
                <div className='list-image'>
                  {<img src={`data:image/png;base64,${image}`} alt={`Image ${book.ID}`} width="90%" height="90%"/>}
                </div>
                <div className='desc'>
                  <h1>{book.Name}</h1>
                  <p>{book.Description}</p>
                </div>
              </div>
            </Link>;
          } else {
            return <Link to={`/venue/${book.Name}-${book.ID}`} key={key} className="custom-link">
              <div className='venue-list' key={key}>
                <div className='list-image'>
                  {<img src={`data:image/png;base64,${image}`} alt={`Image ${book.ID}`} width="90%"  height="90%"/>}
                </div>
                <div className='desc'>
                  <h1>{book.Name}</h1>
                  <p>{book.Description}</p>
                </div>
              </div>
            </Link>;
          }
        })}
  
      </div>
    </div>
    


  );
}

export default VenueListPage;
