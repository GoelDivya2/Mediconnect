import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { Spinner, ErrorBox, Empty, StatusBadge } from '../components/UI.jsx';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const useAppointments = () => {
  const [list, setList] = useState(null); const [err, setErr] = useState('');
  const load = useCallback(() => api.get('/appointments/mine').then(r => setList(r.data)).catch(e => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const update = async (id, status) => { setErr(''); try { await api.patch(`/appointments/${id}/status`, { status }); load(); } catch (e) { setErr(errMsg(e)); } };
  return { list, err, update };
};
const Stat = ({ label, value }) => <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className="font-display text-3xl font-bold text-brand-dark">{value}</p></div>;

export function DoctorDashboard() {
  const { list, err, update } = useAppointments();
  if (!list) return err ? <div className="p-6"><ErrorBox msg={err} /></div> : <Spinner />;
  const t = today();
  const upcoming = list.filter(a => a.status === 'Accepted' && a.appointmentDate >= t).length;
  return (<div className="mx-auto max-w-6xl px-4 py-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Doctor dashboard</h1><Link to="/profile" className="btn-ghost">Edit profile & clinic timings</Link></div>
    <div className="my-6 grid grid-cols-2 gap-4 md:grid-cols-4"><Stat label="Total appointments" value={list.length} /><Stat label="Pending requests" value={list.filter(a => a.status === 'Pending').length} /><Stat label="Accepted" value={list.filter(a => a.status === 'Accepted').length} /><Stat label="Upcoming" value={upcoming} /></div>
    <ErrorBox msg={err} />
    <h2 className="mb-3 mt-4 text-xl font-semibold">Appointment requests</h2>
    {list.length === 0 ? <Empty title="No requests yet" hint="Patients who book with you will appear here." /> :
      <div className="card divide-y divide-slate-100">{list.map(a => (
        <div key={a._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><p className="font-semibold">{a.patientId?.name}</p><p className="text-sm text-slate-500">{a.appointmentDate} at {a.appointmentTime} · {a.patientId?.phone || a.patientId?.email}</p></div>
          <div className="flex items-center gap-2"><StatusBadge status={a.status} />
            {a.status === 'Pending' && <><button className="btn" onClick={() => update(a._id, 'Accepted')}>Accept</button><button className="btn-ghost" onClick={() => update(a._id, 'Rejected')}>Reject</button></>}</div>
        </div>))}</div>}
  </div>);
}

export function PatientDashboard() {
  const { list, err, update } = useAppointments();
  if (!list) return err ? <div className="p-6"><ErrorBox msg={err} /></div> : <Spinner />;
  const t = today();
  const isUp = a => a.appointmentDate >= t && ['Pending', 'Accepted'].includes(a.status);
  const upcoming = list.filter(isUp), prev = list.filter(a => !isUp(a)).reverse();
  const Row = ({ a }) => (<div className="flex flex-wrap items-center justify-between gap-3 p-4">
    <div><p className="font-semibold">{a.doctorId?.name} <span className="text-sm font-normal text-mint">{a.doctorId?.specialization}</span></p><p className="text-sm text-slate-500">{a.appointmentDate} at {a.appointmentTime} · {a.doctorId?.clinicName}, {a.doctorId?.locality}</p></div>
    <div className="flex items-center gap-2"><StatusBadge status={a.status} />{isUp(a) && <button className="btn-ghost" onClick={() => window.confirm('Cancel this appointment?') && update(a._id, 'Cancelled')}>Cancel</button>}</div></div>);
  return (<div className="mx-auto max-w-4xl px-4 py-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Your appointments</h1><Link to="/doctors" className="btn">Find a doctor</Link></div>
    <div className="mt-6"><ErrorBox msg={err} /></div>
    <h2 className="mb-3 mt-4 text-xl font-semibold">Upcoming</h2>
    {upcoming.length === 0 ? <Empty title="Nothing scheduled" hint="Search for a doctor near you and request a slot."><Link to="/doctors" className="btn">Search doctors</Link></Empty> : <div className="card divide-y divide-slate-100">{upcoming.map(a => <Row key={a._id} a={a} />)}</div>}
    <h2 className="mb-3 mt-8 text-xl font-semibold">Previous</h2>
    {prev.length === 0 ? <p className="text-sm text-slate-500">No past appointments yet.</p> : <div className="card divide-y divide-slate-100">{prev.map(a => <Row key={a._id} a={a} />)}</div>}
  </div>);
}
