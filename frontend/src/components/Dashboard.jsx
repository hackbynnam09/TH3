import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name: '', price: '', quantity: '', description: '' };
const money = amount => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchProducts = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.get('/api/products');
      setProducts(data);
    } catch (err) {
      if (err.response?.status === 401) return logout();
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = useMemo(() => products.filter(p => (p.name + ' ' + (p.description || '')).toLowerCase().includes(search.toLowerCase())), [products, search]);
  const inventory = useMemo(() => products.reduce((sum, p) => sum + p.price * p.quantity, 0), [products]);
  const units = useMemo(() => products.reduce((sum, p) => sum + p.quantity, 0), [products]);

  function startEdit(product) {
    setEditingId(product.id);
    setForm({ name: product.name, price: String(product.price), quantity: String(product.quantity), description: product.description || '' });
    setError(''); setNotice('');
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetForm() { setForm(EMPTY); setEditingId(null); }

  async function submit(event) {
    event.preventDefault();
    setError(''); setNotice('');
    const price = Number(form.price); const quantity = Number(form.quantity);
    if (!form.name.trim()) return setError('Tên sản phẩm không được để trống.');
    if (form.name.trim().length > 120) return setError('Tên sản phẩm tối đa 120 ký tự.');
    if (form.description.length > 500) return setError('Mô tả tối đa 500 ký tự.');
    if (!Number.isSafeInteger(price) || price < 0) return setError('Giá phải là số nguyên không âm.');
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 2147483647) return setError('Số lượng phải là số nguyên không âm.');
    setBusy(true);
    const payload = { name: form.name.trim(), price, quantity, description: form.description.trim() };
    try {
      if (editingId === null) {
        await api.post('/api/products', payload);
        setNotice('Đã thêm sản phẩm thành công.');
      } else {
        await api.put(`/api/products/${editingId}`, payload);
        setNotice('Đã cập nhật sản phẩm thành công.');
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) return logout();
      setError(apiErrorMessage(err));
    } finally { setBusy(false); }
  }

  async function remove(product) {
    if (!window.confirm(`Bạn chắc chắn muốn xóa "${product.name}"?`)) return;
    setError(''); setNotice('');
    try {
      await api.delete(`/api/products/${product.id}`);
      setNotice('Đã xóa sản phẩm.');
      if (editingId === product.id) resetForm();
      await fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) return logout();
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-icon">▦</span><span>PRODUCT<span className="brand-accent">HUB</span><small>THỰC HÀNH SỐ 3</small></span></div>
        <div className="account"><span className="account-avatar">{user.email[0].toUpperCase()}</span><div className="account-meta"><strong>Đã đăng nhập</strong><small title={user.email}>{user.email}</small></div><button className="outline-btn logout-btn" type="button" onClick={logout}>Đăng xuất</button></div>
      </header>
      <main className="workspace">
        <div className="dashboard-intro"><div><span className="eyebrow"><span className="dot"/> DASHBOARD / PRODUCT MANAGEMENT</span><h1>Quản lý sản phẩm</h1><p>Chào mừng <strong>{user.email}</strong>. Dữ liệu được lưu trong SQLite và truy xuất qua Web API.</p></div><div className="session-chip"><span className="session-dot"/> Phiên đăng nhập đang hoạt động</div></div>
        <div className="stat-grid"><div className="stat-card"><small>TỔNG SẢN PHẨM</small><strong>{products.length}</strong><span>Danh mục hiện tại</span></div><div className="stat-card"><small>TỔNG SỐ LƯỢNG</small><strong>{units.toLocaleString('vi-VN')}</strong><span>Sản phẩm trong kho</span></div><div className="stat-card large-stat"><small>GIÁ TRỊ TỒN KHO</small><strong>{money(inventory)}</strong><span>Giá × số lượng</span></div></div>
        <div className="dashboard-grid">
          <section className="panel product-form" id="product-form"><div className="panel-head"><div><span className="section-kicker">QUẢN LÝ DỮ LIỆU</span><h2>{editingId === null ? 'Thêm sản phẩm' : `Sửa sản phẩm #${editingId}`}</h2></div><span className="head-icon">＋</span></div>
            <form onSubmit={submit}>
              <label className="field-label" htmlFor="name">TÊN SẢN PHẨM</label><input id="name" value={form.name} maxLength={120} required placeholder="Ví dụ: Bàn phím cơ" onChange={e => setForm({ ...form, name: e.target.value })}/>
              <div className="two-fields"><div><label className="field-label" htmlFor="price">ĐƠN GIÁ (VND)</label><input id="price" type="number" min="0" step="1" required value={form.price} placeholder="750000" onChange={e => setForm({ ...form, price: e.target.value })}/></div><div><label className="field-label" htmlFor="quantity">SỐ LƯỢNG</label><input id="quantity" type="number" min="0" step="1" required value={form.quantity} placeholder="10" onChange={e => setForm({ ...form, quantity: e.target.value })}/></div></div>
              <label className="field-label" htmlFor="description">MÔ TẢ</label><textarea id="description" rows="4" maxLength="500" placeholder="Mô tả thêm về sản phẩm..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/>
              {error && <p className="form-message error" role="alert">{error}</p>}
              {notice && <p className="form-message success" role="status">{notice}</p>}
              <div className="form-actions"><button type="submit" className="primary-btn" disabled={busy}>{busy ? 'Đang lưu...' : editingId === null ? '+ Thêm sản phẩm' : 'Lưu thay đổi'}</button>{editingId !== null && <button type="button" className="outline-btn" onClick={resetForm}>Hủy sửa</button>}</div>
            </form>
          </section>
          <section className="panel inventory-panel"><div className="panel-head"><div><span className="section-kicker">DANH SÁCH SẢN PHẨM</span><h2>Kho sản phẩm <span className="count-pill">{products.length}</span></h2></div><button type="button" className="outline-btn" onClick={fetchProducts}>↻ Làm mới</button></div>
            <div className="list-toolbar"><input type="search" placeholder="Tìm theo tên hoặc mô tả..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm sản phẩm" /></div>
            <div className="table-scroll"><table><thead><tr><th>SẢN PHẨM</th><th>ĐƠN GIÁ</th><th>SL</th><th>THAO TÁC</th></tr></thead><tbody>
              {filtered.map(product => <tr key={product.id}><td><strong className="product-name">{product.name}</strong><small className="product-desc">{product.description || `Mã sản phẩm #${product.id}`}</small></td><td>{money(product.price)}</td><td><span className="qty-tag">{product.quantity}</span></td><td><div className="row-actions"><button type="button" onClick={() => startEdit(product)}>Sửa</button><button type="button" className="delete-action" onClick={() => remove(product)}>Xóa</button></div></td></tr>)}
            </tbody></table></div>
            {loading && <div className="empty-list">Đang tải danh sách...</div>}
            {!loading && filtered.length === 0 && <div className="empty-list">{products.length ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm. Hãy thêm sản phẩm đầu tiên!'}</div>}
          </section>
        </div>
        <footer className="app-footer">TH3 / React Context + localStorage + JWT · ASP.NET Core · EF Core · SQLite</footer>
      </main>
    </div>
  );
}
