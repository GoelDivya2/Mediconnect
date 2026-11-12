
import { useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/UI.jsx';
import { Field } from './Auth.jsx';

const F = [
  ['name', 'Full name'],
  ['phone', 'Phone'],
  ['specialization', 'Specialization'],
  ['qualification', 'Qualification'],
  ['experience', 'Experience (years)', 'number'],
  ['certification', 'Certification'],
  ['clinicName', 'Clinic name'],
  ['clinicAddress', 'Clinic address'],
  ['city', 'City'],
  ['locality', 'Locality'],
  ['state', 'State'],
  ['pincode', 'PIN code'],
  ['consultationFee', 'Consultation fee (₹)', 'number']
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const doc = user.role === 'doctor';

  const [f, setF] = useState({
    ...user,
    slotDuration: user.slotDuration ?? 30
  });

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const fields = doc ? F : F.slice(0, 2);

  const setT = (i, k, v) =>
    setF({
      ...f,
      clinicTimings: f.clinicTimings.map((t, j) =>
        j === i ? { ...t, [k]: v } : t
      )
    });

  const save = async e => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');

    if (
      doc &&
      (!Number.isInteger(Number(f.slotDuration)) ||
        Number(f.slotDuration) < 5 ||
        Number(f.slotDuration) > 180)
    ) {
      setErr('Appointment duration must be between 5 and 180 minutes.');
      setBusy(false);
      return;
    }

    try {
      const payload = {
        ...f,
        ...(doc ? { slotDuration: Number(f.slotDuration) } : {})
      };

      const { data } = await api.put('/auth/profile', payload);
      setUser(data);
      setF(data);
      setMsg('Profile saved.');
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <form onSubmit={save} className="card space-y-6 p-7">

        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-sm text-slate-500">
            {user.email} · {user.role}
          </p>
        </div>

        <ErrorBox msg={err} />

        {msg && (
          <p
            className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
          >
            {msg}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([k, l, type]) => (
            <Field
              key={k}
              label={l}
              type={type || 'text'}
              value={f[k] ?? ''}
              onChange={e => setF({ ...f, [k]: e.target.value })}
            />
          ))}
        </div>

        {doc && (
          <>
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Appointment duration
              </h2>

              <p className="mb-3 text-sm text-slate-500">
                Set how many minutes each appointment will take.
                This duration applies to all your working days.
              </p>

              <div className="max-w-xs">
                <label className="mb-1 block text-sm font-medium">
                  Duration (minutes)
                </label>

                <input
                  type="number"
                  className="input w-full"
                  min="5"
                  max="180"
                  step="1"
                  required
                  value={f.slotDuration}
                  onChange={e =>
                    setF({ ...f, slotDuration: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold">
                Clinic working days & timings
              </h2>

              <div className="space-y-2">
                {f.clinicTimings.map((t, i) => (
                  <div
                    key={t.day}
                    className="grid grid-cols-[110px_1fr_1fr_1fr] items-center gap-2 text-sm"
                  >
                    <label className="flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        checked={t.isOpen}
                        onChange={e =>
                          setT(i, 'isOpen', e.target.checked)
                        }
                      />
                      {t.day.slice(0, 3)}
                    </label>

                    <input
                      type="time"
                      className="input"
                      disabled={!t.isOpen}
                      value={t.start}
                      onChange={e => setT(i, 'start', e.target.value)}
                      aria-label={`${t.day} opening time`}
                    />

                    <input
                      type="time"
                      className="input"
                      disabled={!t.isOpen}
                      value={t.end}
                      onChange={e => setT(i, 'end', e.target.value)}
                      aria-label={`${t.day} closing time`}
                    />

                    <span className="text-xs text-slate-400">
                      {t.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>

      </form>
    </div>
  );
}
