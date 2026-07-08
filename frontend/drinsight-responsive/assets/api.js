/* ============================================================
   DrInsight — Frontend ↔ Laravel Backend Integration Layer
   ------------------------------------------------------------
   HOW TO CONNECT THE BACKEND:
   1. Deploy the Laravel backend (see laravel-backend/README-SETUP.md)
   2. Set API_BASE below to your API URL, e.g.:
        const API_BASE = 'https://api.drinsight.org/api';
      or on shared hosting:
        const API_BASE = 'https://www.drinsight.org/backend/public/api';
   3. That's it — login, register, contact, ask-a-doctor and
      consultation booking will use the real backend.
   While API_BASE is empty, the site runs in front-end demo mode.
   ============================================================ */
const API_BASE = '';               // <-- put your Laravel API URL here

const DrAPI = {
  connected: () => API_BASE.trim() !== '',

  token: {
    get()  { try { return sessionStorage.getItem('drinsight_token'); } catch(e){ return null; } },
    set(t) { try { sessionStorage.setItem('drinsight_token', t); } catch(e){} },
    clear(){ try { sessionStorage.removeItem('drinsight_token'); } catch(e){} }
  },

  async request(path, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const t = DrAPI.token.get();
    if (t) headers['Authorization'] = 'Bearer ' + t;
    const res = await fetch(API_BASE + path, {
      method, headers, body: body ? JSON.stringify(body) : null
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status, data });
    return data;
  },

  /* ---- Auth ---- */
  login:    (email, password)      => DrAPI.request('/login', 'POST', { email, password }),
  register: (payload)              => DrAPI.request('/register', 'POST', payload),
  logout:   ()                     => DrAPI.request('/logout', 'POST'),
  me:       ()                     => DrAPI.request('/me'),

  /* ---- Public content ---- */
  articles:   (params='')          => DrAPI.request('/articles' + params),
  categories: ()                   => DrAPI.request('/categories'),
  doctors:    ()                   => DrAPI.request('/doctors'),

  /* ---- Forms ---- */
  askQuestion:      (payload)      => DrAPI.request('/questions', 'POST', payload),
  bookConsultation: (payload)      => DrAPI.request('/consultations', 'POST', payload),
  contactMessage:   (payload)      => DrAPI.request('/contact', 'POST', payload)
};
