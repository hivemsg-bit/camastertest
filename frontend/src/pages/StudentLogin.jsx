import { useState, useEffect } from 'react'
import axios from 'axios'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export default function StudentLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
    }
  }, [])

  const startOtp = async () => {
    setStatus('Sending OTP...')
    try {
      const conf = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
      setConfirmation(conf)
      setStatus('OTP sent')
    } catch (e) {
      setStatus('Failed to send OTP')
    }
  }

  const verifyOtp = async () => {
    setStatus('Verifying...')
    try {
      const cred = await confirmation.confirm(otp)
      const idToken = await cred.user.getIdToken()
      await api.post('/auth/student/verify', { idToken })
      setStatus('Logged in! You can now download papers.')
    } catch (e) {
      setStatus('Verification failed')
    }
  }

  return (
    <div>
      <h2>Student Login via OTP</h2>
      <div id="recaptcha-container"></div>
      <input placeholder="Phone e.g. +91xxxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={startOtp}>Send OTP</button>
      {confirmation && (
        <div>
          <input placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify</button>
        </div>
      )}
      <p>{status}</p>
    </div>
  )
}

