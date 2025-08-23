import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await register({ fullName, email, password });
      nav('/');
    } catch (err: any) {
      push(err?.response?.data?.message || 'Registration failed.', 'error');
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="bg-accent-600 text-white px-4 py-2 rounded" disabled={loading}>{loading? 'Creating...' : 'Create account'}</button>
      </form>
    </div>
  );
};

export default RegisterPage;


