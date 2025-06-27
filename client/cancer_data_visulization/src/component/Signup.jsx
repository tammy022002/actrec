import React, { useState } from 'react';
import styles from '../assets/Signup.module.css';
import axios from 'axios';
import { Modal } from '@fluentui/react/lib/Modal';
import { Label } from '@fluentui/react/lib/Label';
import { MessageBar, MessageBarType } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Signup = ({ handlePageChange }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    id: '', // Unique ID field
    name: '',
    email: '',
    password: ''
  });
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmedPassword: ''
  });
  const [generalError, setGeneralError] = useState('');
  const [allFieldsRequiredError, setAllFieldsRequiredError] = useState(false);
  const [nameformaterror, setNameformaterror] = useState('');
  const [emailformaterror, setEmailformaterror] = useState('');

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
    setAllFieldsRequiredError(false); // Reset all fields required error when any field is edited

    // Reset specific format errors when user edits the input
    if (name === 'name') {
      setNameformaterror('');
    } else if (name === 'email') {
      setEmailformaterror('');
    }
  };

  const handleConfirmPasswordInput = (event) => {
    const value = event.target.value;
    setConfirmedPassword(value);
    setErrors(prev => ({ ...prev, confirmedPassword: '' }));
    setGeneralError('');
    setAllFieldsRequiredError(false); // Reset all fields required error when confirm password is edited
  };

  const generateUniqueId = () => {
    return uuidv4(); // Generate a unique ID using uuid library
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    let valid = true;
    const { name, email, password } = values;
    const newErrors = { name: '', email: '', password: '', confirmedPassword: '' };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (!nameRegex.test(name)) {
      setNameformaterror('Name should contain letters and spaces only');
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailformaterror('Invalid email format');
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters long';
      valid = false;
    }

    if (!confirmedPassword.trim()) {
      newErrors.confirmedPassword = 'Confirm password is required';
      valid = false;
    } else if (password !== confirmedPassword) {
      newErrors.confirmedPassword = 'Passwords does not match';
      valid = false;
    }

    setErrors(newErrors);
    setAllFieldsRequiredError(!valid); // Set all fields required error based on form validity
    return valid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      const id = generateUniqueId(); // Generate unique ID
      axios.post('http://localhost:8088/signup', { ...values, id })
        .then(res => {
          setIsModalOpen(true);
        })
        .catch(err => {
          console.log(err);
          setGeneralError('Failed to create account. Please try again.');
        });
    } else {
      setGeneralError('');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  const goToSignInPage = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 style={{marginLeft:"30px"}} >Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className={`${styles.mb3} ${styles.inputGroup}`}>
            <Label required>Name</Label>
            <input
              type="text"
              placeholder="Enter your name"
              onChange={handleInput}
              name="name"
              value={values.name}
              style={{ border: errors.name ? '1px solid red' : '1px solid #ccc' }}
            />
            {nameformaterror && <div className={styles.errorMessage}>{nameformaterror}</div>}
          </div>

          <div className={`${styles.mb3} ${styles.inputGroup}`}>
            <Label required>Email</Label>
            <input
              type="text"
              placeholder="Enter your email"
              onChange={handleInput}
              name="email"
              value={values.email}
              style={{ border: errors.email ? '1px solid red' : '1px solid #ccc' }}
            />
            {emailformaterror && <div className={styles.errorMessage}>{emailformaterror}</div>}
          </div>

          <div className={`${styles.mb3} ${styles.inputGroup}`}>
            <Label required>Password</Label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={handleInput}
              name="password"
              value={values.password}
              style={{ border: errors.password ? '1px solid red' : '1px solid #ccc' }}
            />

          </div>

          <div className={`${styles.mb3} ${styles.inputGroup}`}>
            <Label required>Confirm Password</Label>
            <input
              type="password"
              placeholder="Confirm your password"
              onChange={handleConfirmPasswordInput}
              value={confirmedPassword}
              style={{ border: errors.confirmedPassword ? '1px solid red' : '1px solid #ccc' }}
            />
            {errors.confirmedPassword && <div className={styles.errorMessage}>{errors.confirmedPassword}</div>}
          </div>

          {allFieldsRequiredError && (
            <MessageBar
              messageBarType={MessageBarType.error}
              styles={{ root: { marginBottom: '10px' } }}
            >
              All fields are required
            </MessageBar>
          )}

          {generalError && (
            <MessageBar
              messageBarType={MessageBarType.error}
              styles={{ root: { marginBottom: '10px' } }}
            >
              {generalError}
            </MessageBar>
          )}


          <div className={styles.btnContainer}>
            <button type="button" className={`${styles.btn} ${styles.btnSignIn}`} onClick={goToSignInPage}>SIGN IN</button>
            <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>SUBMIT</button>
          </div>

        </form>
      </div>
      <Modal isOpen={isModalOpen} onDismiss={closeModal} className={styles.customModal}>
        <div className={styles.modalContent}>
          <Label className={styles.modalLabel}>Success</Label>
          <p>Your account has been created successfully!</p>
          <button className={styles.btn} onClick={closeModal}>OK</button>
        </div>
      </Modal>
    </div>
  );
}

export default Signup;
