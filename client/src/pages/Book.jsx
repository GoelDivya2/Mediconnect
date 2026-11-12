
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { Spinner, ErrorBox } from '../components/UI.jsx';

const ymd = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Book() {
  const { id } = useParams();
  const nav = useNavigate();

  const [d, setD] = useState(null);
  const [date, setDate] = useState(ymd(new Date()));
  const [info, setInfo] = useState(null);
  const [time, setTime] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(r => setD(r.data))
      .catch(e => setErr(errMsg(e)));
  }, [id]);

  useEffect(() => {
    setTime('');
    setInfo(null);

    api.get(`/doctors/${id}/slots`, { params: { date } })
      .then(r => setInfo(r.data))
      .catch(e => setErr(errMsg(e)));
  }, [id, date]);

  const submit = async () => {
    if (!time) return;

    setBusy(true);
    setErr('');

    try {
      await api.post('/appointments', {
        doctorId: id,
        appointmentDate: date,
        appointmentTime: time
      });

      nav('/dashboard');
    } catch (e) {
      setErr(errMsg(e));

      api.get(`/doctors/${id}/slots`, { params: { date } })
        .then(r => setInfo(r.data));

      setTime('');
    } finally {
      setBusy(false);
    }
  };

  if (!d) {
    return err
      ? <div className="p-6"><ErrorBox msg={err} /></div>
      : <Spinner />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card p-7">

        <h1 className="text-3xl font-bold">
          Book with {d.name}
        </h1>

        <p className="text-sm text-slate-500">
          {d.specialization} · {d.clinicName}, {d.locality}, {d.city} · ₹{d.consultationFee}
        </p>

        <p className="mt-3 text-sm font-medium text-mint">
          Appointment duration: {d.slotDuration || 30} minutes
        </p>

        <div className="mt-6 max-w-xs">
          <label className="label">Choose a date</label>

          <input
            type="date"
            className="input"
            min={ymd(new Date())}
            value={date}
            onChange={e => e.target.value && setDate(e.target.value)}
          />
        </div>

        <h2 className="mb-3 mt-6 text-lg font-semibold">
          Available slots
        </h2>

        {!info ? (
          <Spinner />
        ) : !info.open ? (
          <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            The clinic is closed on this day. Pick another date.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">
              Clinic timing: {info.start} – {info.end}
              {' · '}
              Each slot: {info.slotDuration} minutes
            </p>

            {info.slots.length === 0 ? (
              <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                No appointment slots are available for this date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {info.slots.map(s => (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    onClick={() => setTime(s.time)}
                    className={`rounded-xl border py-2 text-sm font-medium ${
                      time === s.time
                        ? 'border-brand bg-brand text-white'
                        : s.available
                          ? 'border-brand/20 bg-white hover:bg-brand-soft'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-6 space-y-3">
          <ErrorBox msg={err} />

          <button
            className="btn"
            disabled={!time || busy}
            onClick={submit}
          >
            {busy
              ? 'Sending request…'
              : time
                ? `Request ${time} on ${date}`
                : 'Select a slot to continue'}
          </button>
        </div>

      </div>
    </div>
  );
}
