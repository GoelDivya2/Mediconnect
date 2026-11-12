
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { Spinner, ErrorBox } from '../components/UI.jsx';

export default function DoctorDetails() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(r => setD(r.data))
      .catch(e => setErr(errMsg(e)));
  }, [id]);

  if (err) return <div className="mx-auto max-w-3xl p-6"><ErrorBox msg={err} /></div>;
  if (!d) return <Spinner />;

  const rows = [
    ['Qualification', d.qualification],
    ['Experience', `${d.experience} years`],
    ['Certification', d.certification || '—'],
    ['Consultation fee', `₹${d.consultationFee}`],
    ['Appointment duration', `${d.slotDuration || 30} minutes`],
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-[2fr_1fr]">
      <div className="card p-7">
        <h1 className="text-3xl font-bold">{d.name}</h1>
        <p className="font-medium text-mint">{d.specialization}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-500">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-8 text-xl font-semibold">{d.clinicName}</h2>
        <p className="text-sm text-slate-600">
          {d.clinicAddress}, {d.locality}, {d.city}, {d.state} – {d.pincode}
        </p>

        {d.phone && (
          <p className="mt-1 text-sm text-slate-600">Phone: {d.phone}</p>
        )}
      </div>

      <div className="card h-fit p-6">
        <h2 className="text-lg font-semibold">Clinic timings</h2>

        <ul className="mt-3 space-y-1.5 text-sm">
          {d.clinicTimings.map(t => (
            <li key={t.day} className="flex justify-between">
              <span>{t.day}</span>
              <span className={t.isOpen ? 'font-medium' : 'text-slate-400'}>
                {t.isOpen ? `${t.start} – ${t.end}` : 'Closed'}
              </span>
            </li>
          ))}
        </ul>

        <Link to={`/book/${d._id}`} className="btn mt-5 w-full">
          Book appointment
        </Link>
      </div>
    </div>
  );
}
