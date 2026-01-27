import React from 'react'
import './Login.css'
import assets from '../../assets/assets'

function Login() {
  return (
    <div className='login'>
      
      <img src={assets.logo_big} alt="Logo" className='logo' />

      <form className="login-form">

        <h2>Sign Up</h2>
        <input type="text" placeholder='username' classNam="form-input" required /> 
        <input type="email" placeholder='Email Address' classNam="form-input" required />
        <input type="password" placeholder='Password' className="form-input"  required />
        <button type='submit'>Sign Up</button>

        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="login-forget">
          <p className="login-toggle"> Already have an account <span>Click here</span>
          </p>
        </div>

      </form>

    </div>
  )
}

export default Login
