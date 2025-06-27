import React from 'react';
import styles from '../assets/Access.module.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import logo from '../assets/images/Actrec_logo.jpg';
// import ImageSlider from './ImageSlider';
import Footer from './Footer';

const Access = () => {
  const navigate = useNavigate();
  const goToLoginPage = () => {
    navigate('/login');
  }
  const goToSignupPage = () => {
    navigate('/signup');
  }
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.logo}></div>
        <div className={styles['button-container']}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ cursor: 'pointer', backgroundColor: '#007bff' }}
            onClick={goToLoginPage}
          >
            Sign-in
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ cursor: 'pointer' , backgroundColor: '#007bff' }}
            onClick={goToSignupPage}
          >
            Create Account
          </button>
        </div>
        <div className={styles.marquee}>
          <p>Welcome to  ACTREC </p>
        </div>

        <div className={styles['image-slider-container']}>
          {/* <ImageSlider /> */}
          <div className={styles.content}>
            <h2>We Give high privacy to Patient data.</h2>
        
          </div>
        </div>
      </div>
      <div id="footer" style={{marginTop:"350px"}}><Footer /></div>
    </>

  );
};

export default Access;
