import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { DoctorCard, Spinner, ErrorBox, Empty } from '../components/UI.jsx';
const SPECS = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'General Physician', 'Dentist', 'Gynecologist', 'Neurologist', 'ENT Specialist'];
export default function Doctors() {
  const [sp] = useSearchParams();
  const blank = { name: '', specialization: '', city: '', locality: '', pincode: '' };
  const [f, setF] = useState({ ...blank, city: sp.get('city') || '', specialization: sp.get('specialization') || '' });
  const [list, setList] = useState([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState('');
  const load = async (filters = f) => { setLoading(true); setErr('');
    try { const { data } = await api.get('/doctors', { params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }); setList(data); } catch (e) { setErr(errMsg(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []); // eslint-disable-line
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const clear = () => { setF(blank); load(blank); };
  return (<div className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-3xl font-bold">Find a doctor</h1>
    <form onSubmit={e => { e.preventDefault(); load(); }} className="card my-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input className="input lg:col-span-2" placeholder="Doctor name" value={f.name} onChange={set('name')} aria-label="Doctor name" />
      <select className="input" value={f.specialization} onChange={set('specialization')} aria-label="Specialization"><option value="">All specializations</option>{SPECS.map(s => <option key={s}>{s}</option>)}</select>
      <input className="input" placeholder="City" value={f.city} onChange={set('city')} aria-label="City" />
      <input className="input" placeholder="Locality" value={f.locality} onChange={set('locality')} aria-label="Locality" />
      <input className="input" placeholder="PIN code" maxLength={6} value={f.pincode} onChange={set('pincode')} aria-label="PIN code" />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-6"><button className="btn">Search</button><button type="button" className="btn-ghost" onClick={clear}>Clear filters</button></div>
    </form>
    <ErrorBox msg={err} />
    {loading ? <Spinner /> : !err && (list.length === 0
      ? <Empty title="No doctors match these filters" hint="Try a nearby locality, a different specialization, or clear the filters."><button className="btn" onClick={clear}>Show all doctors</button></Empty>
      : <><p className="mb-3 text-sm text-slate-500">{list.length} doctor{list.length > 1 && 's'} found</p><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map(d => <DoctorCard key={d._id} d={d} />)}</div></>)}
  </div>);
}
