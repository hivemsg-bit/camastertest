import { useEffect, useState } from 'react';
import { auth, ensureRecaptcha, signInWithPhoneNumber, onAuthStateChanged } from '@/lib/firebase.js';

export default function StudentLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setStatus(`Logged in as ${user.phoneNumber}`);
    });
    return () => unsub();
  }, []);

  const sendOtp = async () => {
    try {
      setStatus('Sending OTP...');
      const verifier = ensureRecaptcha();
      const conf = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(conf);
      setStatus('OTP sent. Please check your phone.');
    } catch (e) {
      setStatus(e.message);
    }
  };

  const verifyOtp = async () => {
    try {
      setStatus('Verifying OTP...');
      await confirmation.confirm(otp);
      setStatus('Logged in');
    } catch (e) {
      setStatus(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Student Login via OTP</h2>
      <div id="recaptcha-container"></div>
      <label>Phone number (E.164, e.g. +91XXXXXXXXXX)</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." style={{ display: 'block', width: '100%', marginBottom: 8 }} />
      <button onClick={sendOtp} disabled={!phone || !!confirmation}>Send OTP</button>
      {confirmation && (
        <div style={{ marginTop: 12 }}>
          <label>Enter OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
          <button onClick={verifyOtp} disabled={!otp}>Verify</button>
        </div>
      )}
      <p>{status}</p>
    </div>
  );
}

