import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import './app.css'
import './applications.css'

import axios from 'axios';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VenuePage from "./pages/VenuePage";
import VenueListPage from "./pages/VenueListPage";
import VenueDetailPage from './pages/VenueDetailPage'; 
import VenueEditPage from './pages/VenueEditPage'; 
import Header from "./Header";
import Selector from "./Selector";
import Layout from "./Layout";
import LayoutS from "./Layout-specific"
import baseUrl from "./backend";
import FirstPage from "./pages/FirstPage";
import EventsPage from "./pages/EventsPage";
import MyVenuesPage from "./pages/MyVenuesPage";
import ApplicationsPage from "./pages/ApplicationsPage";



//axios.defaults.baseURL = process.env.BASE_URL + `:` + process.env.BACKEND_PORT;
axios.defaults.baseURL = "https://eventify-digitalocean-backend.onrender.com";



function App() {



  return (
    <Router>
      
      <Routes>
        <Route element={<Layout />}>

        <Route path="/" element={<FirstPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/venue/list" element={<VenueListPage />} />
        <Route path="/venue/:bookName" element={<VenueDetailPage />} />
        <Route path="/venue/edit/:bookName" element={<VenueEditPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route element={<LayoutS/>}>
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/venue" element={<VenuePage />} />
        <Route path="/myvenues" element={<MyVenuesPage />} />
        </Route>
   
    
        </Route>
   
      
      </Routes>
        
    

      
    </Router>
  );
}

export default App;
