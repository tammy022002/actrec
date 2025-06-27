import React from 'react';
import './App.css';
import Sample_rechart from './component/sample_rechart';
import Analysis from './component/Analysis';
import About from './component/About';
import Contact from './component/Contact';
import Homepage from './component/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Signup from './component/Signup';
import Access from './component/Access';
import Error from './component/Error';
import HomePage1 from './component/HomePage1';
import QueryPage from './component/QueryPage';
import Demo_analysis from './component/Demo_analysis';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage1 />} />
   
          <Route path="/login" element={<Login />} />
         
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Error />} />
          <Route path="/querypage" element={<QueryPage />} />
          <Route path="/demo_analysis" element={<Demo_analysis />} />
          <Route path='/homepage' element = {<Homepage></Homepage>}></Route>

                 {/* <Route path="/" element={<QueryPage/>} /> */}
          {/* <Route path="/" element={<Access/>} /> */}
           {/* <Route path="/" element={<Sample_rechart/>} /> */}
        </Routes>

      </div>
    </Router>
  );
}

export default App;
