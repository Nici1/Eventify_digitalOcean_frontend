import { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './selector.css'
import './app.css'

export default function Selector() {


  return (
    <div className='selector-container'>
        <div className='selector'>
        <Link className='custom-link' to={'/venue'}>
            <div >Add venues</div>
        </Link>
        <Link className='custom-link' to={'/myvenues'}>
            <div className='my-venues'>My venues</div>
        </Link>
        <Link className='custom-link' to={'/applications'}>
            <div>Applications</div>
        </Link>
        
        </div>
    </div>
  );
}