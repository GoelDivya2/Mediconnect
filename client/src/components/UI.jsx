import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const link = ({ isActive }) => `text-sm font-medium ${isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'}`;
  return (
    <header className="sticky top-0 z-20 border-b border-brand/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold text-brand-dark">Medi<span className="text-mint">Connect</span></Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/doctors" className={link}>Find doctors</NavLink>
          {user && <NavLink to="/dashboard" className={link}>Dashboard</NavLink>}
          {user && <NavLink to="/profile" className={link}>Profile</NavLink>}
          {user ? <button className="btn-ghost" onClick={() => { logout(); nav('/'); }}>Log out</button>
            : <><Link to="/login" className={link({ isActive: false })}>Log in</Link><Link to="/register" className="btn">Sign up</Link></>}
        </nav>
      </div>
    </header>
  );
}

export function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

export const Spinner = () => <div className="flex justify-center py-16"><div className="h-9 w-9 animate-spin rounded-full border-4 border-brand/20 border-t-brand" role="status" aria-label="Loading" /></div>;
export const ErrorBox = ({ msg }) => msg ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{msg}</p> : null;
export const Empty = ({ title, hint, children }) => <div className="card px-6 py-12 text-center"><h3 className="text-lg font-semibold">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{hint}</p><div className="mt-4">{children}</div></div>;

const tone = { Pending: 'bg-amber-100 text-amber-800', Accepted: 'bg-emerald-100 text-emerald-800', Rejected: 'bg-red-100 text-red-700', Cancelled: 'bg-slate-200 text-slate-600' };
export const StatusBadge = ({ status }) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status]}`}>{status}</span>;

export function DoctorCard({ d }) {
  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-white">{d.name.replace('Dr. ', '')[0]}</div>
        <div><h3 className="text-lg font-bold leading-tight">{d.name}</h3><p className="text-sm font-medium text-mint">{d.specialization}</p><p className="text-xs text-slate-500">{d.qualification} · {d.experience} yrs</p></div>
      </div>
      <div className="text-sm text-slate-600"><p className="font-semibold text-ink">{d.clinicName}</p><p>{d.clinicAddress}, {d.locality}, {d.city} – {d.pincode}</p></div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <p className="text-sm">Fee <span className="text-base font-bold">₹{d.consultationFee}</span></p>
        <div className="flex gap-2"><Link className="btn-ghost" to={`/doctors/${d._id}`}>View profile</Link><Link className="btn" to={`/book/${d._id}`}>Book</Link></div>
      </div>
    </div>
  );
}
