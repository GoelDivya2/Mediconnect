import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import { ErrorBox } from '../components/UI.jsx';

const Shell = ({ title, sub, children }) => <div className="mx-auto max-w-xl px-4 py-12"><div className="card p-7"><h1 className="text-3xl font-bold">{title}</h1><p className="mb-6 mt-1 text-sm text-slate-500">{sub}</p>{children}</div></div>;
export const Field = ({ label, ...p }) => <div><label className="label">{label}</label><input className="input" {...p} /></div>;

export function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async e => { e.preventDefault(); setBusy(true); setErr(''); try { await login(f); nav('/dashboard'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return (<Shell title="Welcome back" sub="Log in as a doctor or patient.">
    <form onSubmit={submit} className="space-y-4">
      <ErrorBox msg={err} />
      <Field label="Email" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <Field label="Password" type="password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      <button className="btn w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <p className="text-center text-sm text-slate-500">New here? <Link className="font-semibold text-brand" to="/register">Create an account</Link></p>
    </form></Shell>);
}

export function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ role: 'patient', name: '', email: '', password: '', phone: '', specialization: '', qualification: '', experience: '', certification: '', clinicName: '', clinicAddress: '', city: '', locality: '', state: '', pincode: '', consultationFee: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const doc = f.role === 'doctor';
  const submit = async e => { e.preventDefault(); setBusy(true); setErr('');
    try { await register({ ...f, experience: Number(f.experience), consultationFee: Number(f.consultationFee) }); nav('/dashboard'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); } };
  return (<Shell title="Create your account" sub="Choose how you will use MediConnect.">
    <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-brand-soft p-1">{['patient', 'doctor'].map(r => <button type="button" key={r} onClick={() => setF({ ...f, role: r })} className={`rounded-lg py-2 text-sm font-semibold capitalize ${f.role === r ? 'bg-white text-brand shadow' : 'text-slate-500'}`}>I am a {r}</button>)}</div>
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><ErrorBox msg={err} /></div>
      <Field label="Full name" required value={f.name} onChange={set('name')} />
      <Field label="Phone" value={f.phone} onChange={set('phone')} />
      <Field label="Email" type="email" required value={f.email} onChange={set('email')} />
      <Field label="Password (min 6)" type="password" minLength={6} required value={f.password} onChange={set('password')} />
      {doc && <>
        <Field label="Specialization" required value={f.specialization} onChange={set('specialization')} />
        <Field label="Qualification" required value={f.qualification} onChange={set('qualification')} />
        <Field label="Experience (years)" type="number" min="0" required value={f.experience} onChange={set('experience')} />
        <Field label="Certification" value={f.certification} onChange={set('certification')} />
        <Field label="Clinic name" required value={f.clinicName} onChange={set('clinicName')} />
        <Field label="Consultation fee (₹)" type="number" min="0" required value={f.consultationFee} onChange={set('consultationFee')} />
        <div className="sm:col-span-2"><Field label="Clinic address" required value={f.clinicAddress} onChange={set('clinicAddress')} /></div>
        <Field label="City" required value={f.city} onChange={set('city')} />
        <Field label="Locality" required value={f.locality} onChange={set('locality')} />
        <Field label="State" required value={f.state} onChange={set('state')} />
        <Field label="PIN code" pattern="\d{6}" title="6 digits" required value={f.pincode} onChange={set('pincode')} />
      </>}
      <button className="btn sm:col-span-2" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form></Shell>);
}
