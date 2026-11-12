import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function Landing() {
  const nav = useNavigate(); const [q, setQ] = useState({ city: '', specialization: '' });
  const go = e => { e.preventDefault(); nav('/doctors?' + new URLSearchParams(Object.entries(q).filter(([, v]) => v))); };
  return (<>
    <section className="bg-gradient-to-b from-white to-brand-soft">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold leading-tight text-brand-dark sm:text-6xl">A doctor in your neighbourhood, booked in a minute</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">Search clinics by city, locality or PIN code, see real timings, and request a slot without calling anyone.</p>
        <form onSubmit={go} className="card mx-auto mt-10 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]">
          <input className="input" placeholder="City, locality or PIN" value={q.city} onChange={e => setQ({ ...q, city: e.target.value })} aria-label="Location" />
          <input className="input" placeholder="Specialization, e.g. Cardiologist" value={q.specialization} onChange={e => setQ({ ...q, specialization: e.target.value })} aria-label="Specialization" />
          <button className="btn">Search doctors</button>
        </form>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:grid-cols-3">
      {[['Search by place', 'Filter by city, locality and PIN code together with specialization.'], ['See real availability', 'Working days, clinic hours and open 30-minute slots on every profile.'], ['Track your request', 'Pending, accepted, rejected or cancelled, always visible in your dashboard.']].map(([t, d]) => <div key={t} className="card p-6"><h3 className="text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-slate-600">{d}</p></div>)}
    </section>
    <section className="mx-auto max-w-6xl px-4 pb-16"><div className="card flex flex-wrap items-center justify-between gap-4 bg-brand-dark p-8 text-white"><div><h2 className="text-2xl font-bold">Run a clinic?</h2><p className="text-sm text-white/80">Publish your profile and timings, then accept or reject requests from one dashboard.</p></div><Link to="/register" className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-dark">Join as a doctor</Link></div></section>
  </>);
}
