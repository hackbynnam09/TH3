import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { apiErrorMessage } from './api/client';
import Dashboard from './components/Dashboard';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Symbol({ name }) {
  const shapes = {
    boxes: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="m3 3 18 18M10.6 5.1c.5-.1.9-.1 1.4-.1 6.5 0 10 7 10 7a17 17 0 0 1-3 3.7M6.1 6.1C3.6 8 2 12 2 12s3.5 7 10 7c1.7 0 3.3-.5 4.6-1.3M10 10a3 3 0 0 0 4 4"/></>
  };
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  function switchMode(next) {
    setMode(next);
    setPassword('');
    setConfirm('');
    setError('');
    setNotice('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) return setError('Vui lòng nhập email hợp lệ.');
    if (!password) return setError('Vui lòng nhập mật khẩu.');
    if (isRegister) {
      if (password.length < 8) return setError('Mật khẩu cần ít nhất 8 ký tự.');
      if (password.length > 128) return setError('Mật khẩu không được quá 128 ký tự.');
      if (!/[a-zA-ZÀ-ỹ]/u.test(password) || !/\d/.test(password))
        return setError('Mật khẩu cần có cả chữ cái và chữ số.');
      if (password !== confirm) return setError('Nhập lại mật khẩu chưa khớp.');
    }
    setBusy(true);
    try {
      if (isRegister) {
        await register(trimmed, password);
        setMode('login');
        setPassword('');
        setConfirm('');
        setNotice('Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.');
      } else {
        await login(trimmed, password);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <aside className="auth-story">
        <div className="brand brand-light"><span className="brand-icon"><Symbol name="boxes" /></span><span>PRODUCT<span className="brand-accent">HUB</span><small>THỰC HÀNH SỐ 3</small></span></div>
        <div className="story-content">
          <span className="eyebrow eyebrow-light"><span className="dot"/> FULLSTACK AUTH SYSTEM</span>
          <h1>Quản lý sản phẩm.<br/><span>Đơn giản hơn.</span></h1>
          <p>Kết hợp React, ASP.NET Core Web API và SQLite trong một ứng dụng có đăng ký, đăng nhập và quản lý phiên người dùng.</p>
          <div className="story-steps"><div><span>01</span> Kiểm tra dữ liệu đầu vào</div><div><span>02</span> Xác thực tài khoản với database</div><div><span>03</span> Lưu trạng thái bằng Context</div></div>
        </div>
        <div className="story-bottom"><Symbol name="shield"/> Mật khẩu được hash trước khi lưu vào DB</div>
        <div className="orb orb-one"/><div className="orb orb-two"/>
      </aside>
      <section className="auth-content">
        <div className="auth-topline">BÀI TẬP THỰC HÀNH <strong>03 / AUTH</strong></div>
        <div className="auth-card">
          <div className="auth-tag">{isRegister ? 'TẠO TÀI KHOẢN' : 'CHÀO MỪNG TRỞ LẠI'}</div>
          <h2>{isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống'}</h2>
          <p className="auth-subtitle">{isRegister ? 'Tạo tài khoản để bắt đầu quản lý sản phẩm.' : 'Nhập thông tin của bạn để tiếp tục.'}</p>
          <div className="auth-switch" role="group" aria-label="Chọn chế độ"><button className={!isRegister ? 'selected' : ''} type="button" onClick={() => switchMode('login')}>Đăng nhập</button><button className={isRegister ? 'selected' : ''} type="button" onClick={() => switchMode('register')}>Đăng ký</button></div>
          <form onSubmit={submit} noValidate>
            <label className="field-label" htmlFor="email">ĐỊA CHỈ EMAIL</label>
            <input id="email" type="email" autoComplete="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
            <label className="field-label" htmlFor="password">MẬT KHẨU</label>
            <div className="password-box"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Nhập mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required/><button type="button" className="show-pass" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(!showPassword)}><Symbol name={showPassword ? 'eyeoff' : 'eye'}/></button></div>
            {isRegister && <><label className="field-label" htmlFor="confirm">NHẬP LẠI MẬT KHẨU</label><input id="confirm" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" value={confirm} onChange={e => setConfirm(e.target.value)} required/><p className="field-hint">Ít nhất 8 ký tự, gồm chữ cái và chữ số.</p></>}
            {error && <p className="form-message error" role="alert">{error}</p>}
            {notice && <p className="form-message success" role="status">{notice}</p>}
            <button className="primary-btn submit-btn" type="submit" disabled={busy}>{busy ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'} <Symbol name="arrow" /></button>
          </form>
          <p className="auth-footer">{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')}>{isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}</button></p>
        </div>
        <p className="version-note">ASP.NET Core 10 · React · SQLite · Entity Framework Core</p>
      </section>
    </main>
  );
}

export default function App() {
  const { user, checking } = useAuth();
  if (checking) return <div className="loading-page"><div className="loader"/><p>Đang kiểm tra phiên đăng nhập...</p></div>;
  return user ? <Dashboard /> : <AuthScreen />;
}
