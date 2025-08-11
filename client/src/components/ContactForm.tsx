import React, { useState } from 'react';
import api from '../services/api';

const ContactForm: React.FC<{ villaId: number }> = ({ villaId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/villas/${villaId}/contact`, { name, email, message });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };
  if (sent) return <div className="p-4 bg-green-50 border border-green-200 rounded">Thanks! We will get back to you shortly.</div>;
  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required />
      <input className="input" placeholder="Your email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <textarea className="input" placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} rows={4} required />
      <button disabled={loading} className="bg-accent-600 text-white px-4 py-2 rounded">{loading ? 'Sending...' : 'Send'}</button>
    </form>
  );
};

export default ContactForm;


