import Head from 'next/head';
import { 
  FaShieldAlt, FaServer, FaTerminal, FaUsers, FaUtensils, 
  FaWindows, FaAndroid, FaWifi, FaArrowRight, FaDownload,
  FaCheckCircle, FaClock, FaBolt, FaCreditCard, FaChartLine,
  FaPhone, FaEnvelope, FaGithub, FaLinkedin, FaTwitter
} from 'react-icons/fa';

export default function Home() {
  return (
    <>
      <Head>
        <title>Allsafex · unified Allsafe‑Access & product grid</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --bg-main: #f6f9fe;
            --card-bg: #ffffff;
            --navy-deep: #0b1e32;
            --navy-mid: #1e3a5f;
            --allsafe-blue: #1d4ed8;
            --shonet-green: #0f766e;
            --accent-amber: #b45309;
            --text-dark: #17212d;
            --text-muted: #33475b;
            --border-soft: #dee7f2;
            --cool-shadow: 0 20px 30px -10px rgba(0, 30, 50, 0.12);
            --radius-card: 2rem;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--bg-main);
            color: var(--text-dark);
            line-height: 1.5;
          }
          html { scroll-behavior: smooth; }

          nav {
            background: var(--navy-deep);
            height: 80px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8%;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid #1e4468;
          }

          .logo {
            font-size: 2rem;
            font-weight: 800;
            color: white;
            letter-spacing: -1px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }
          .logo-box {
            width: 36px;
            height: 36px;
            background: linear-gradient(145deg, #2563eb, #0f766e);
            border-radius: 10px;
          }
          .nav-links {
            display: flex;
            gap: 2.5rem;
            align-items: center;
          }
          .nav-links a {
            color: #c1d9ff;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
          }
          .nav-links a:hover { color: white; }

          .hero {
            background: var(--navy-deep);
            padding: 100px 8% 100px;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          /* Tech background elements */
          .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.15) 0%, transparent 30%),
              radial-gradient(circle at 80% 70%, rgba(15, 118, 110, 0.15) 0%, transparent 30%),
              linear-gradient(45deg, transparent 65%, rgba(255,255,255,0.03) 100%);
            pointer-events: none;
          }

          /* Circuit lines pattern */
          .hero::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              linear-gradient(rgba(29, 78, 216, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 78, 216, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 70%);
            -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 70%);
            pointer-events: none;
          }

          /* Floating tech icons */
          .tech-icon {
            position: absolute;
            font-size: 1.5rem;
            color: rgba(255,255,255,0.1);
            pointer-events: none;
            animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          .hero h1 {
            font-size: clamp(2.8rem, 7vw, 4.8rem);
            font-weight: 800;
            letter-spacing: -1.5px;
            margin-top: 20px;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 20px rgba(0,0,0,0.3);
          }

          .hero .sub {
            font-size: 1.3rem;
            color: #b4d0ff;
            max-width: 750px;
            margin: 1.5rem auto 2rem;
            position: relative;
            z-index: 2;
          }

          .domain-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem 3rem;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            margin: 40px auto 30px;
            padding: 1rem 2.5rem;
            border-radius: 60px;
            width: fit-content;
            border: 1px solid rgba(255,255,255,0.2);
            position: relative;
            z-index: 2;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }

          .domain-item a {
            text-decoration: none;
            font-weight: 600;
            color: white;
            font-size: 1rem;
            transition: color 0.3s;
          }
          .domain-item a:hover { color: var(--allsafe-blue); }

          .catalog {
            max-width: 1300px;
            margin: 40px auto 80px;
            padding: 0 24px;
            position: relative;
            z-index: 10;
          }

          .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 3rem 0 1.5rem 0.5rem;
            color: var(--navy-deep);
            border-left: 8px solid var(--allsafe-blue);
            padding-left: 1.5rem;
          }
          .section-title.shonet-title {
            border-left-color: var(--shonet-green);
          }
          .section-title.utility-title {
            border-left-color: var(--accent-amber);
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }

          .product-card {
            background: var(--card-bg);
            border-radius: var(--radius-card);
            padding: 2rem 1.8rem 2rem;
            box-shadow: var(--cool-shadow);
            border: 1px solid var(--border-soft);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
          }
          .product-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 28px 40px -12px #143650;
          }
          .product-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 6px;
            background: var(--card-accent, var(--allsafe-blue));
          }

          .card-badge {
            font-size: 0.7rem;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--card-accent, var(--allsafe-blue));
            margin-bottom: 1rem;
          }

          .product-card h3 {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 0.75rem;
            line-height: 1.2;
          }

          .product-desc {
            color: var(--text-muted);
            margin: 0.5rem 0 1.5rem;
            font-size: 0.98rem;
            flex: 1;
          }

          .link-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem 1.2rem;
            margin-top: 1rem;
            align-items: center;
          }
          .link-group a {
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border-bottom: 2px solid transparent;
            transition: border-color 0.1s;
          }
          .link-group a:hover {
            border-bottom-color: currentColor;
          }

          .primary-link {
            color: var(--card-accent, var(--allsafe-blue));
            font-weight: 700;
          }
          .external-link {
            color: var(--text-muted);
          }
          .pill-tag {
            background: #e2ebf6;
            padding: 0.2rem 1rem;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--navy-mid);
          }

          .card-allsafe { --card-accent: #1d4ed8; }
          .card-shonet { --card-accent: #0f766e; }
          .card-tool { --card-accent: #b45309; }
          .card-docs { --card-accent: #4b5563; }

          footer {
            background: var(--navy-deep);
            color: white;
            padding: 70px 8% 30px;
            margin-top: 70px;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.8fr;
            gap: 3rem;
            padding-bottom: 3rem;
            border-bottom: 1px solid #1f4a6b;
          }
          .footer-col h5 {
            color: #9eb9e0;
            font-size: 0.8rem;
            letter-spacing: 1.5px;
            margin-bottom: 1.5rem;
          }
          .footer-col ul { list-style: none; }
          .footer-col li { margin-bottom: 0.8rem; }
          .footer-col a { color: #c5dbff; text-decoration: none; }
          .admin-card {
            background: #0e2842;
            padding: 1.8rem;
            border-radius: 1.8rem;
            border: 1px solid #28527a;
          }

          @media (max-width: 700px) {
            .nav-links { display: none; }
            .product-grid { grid-template-columns: 1fr; }
            .hero { padding: 80px 5% 80px; }
            .catalog { margin: 20px auto 60px; }
            .domain-row {
              gap: 1rem;
              padding: 0.8rem 1.2rem;
              margin: 20px auto 20px;
            }
            .domain-item a {
              font-size: 0.9rem;
            }
            .section-title {
              font-size: 1.5rem;
              margin: 2rem 0 1rem 0.5rem;
            }
            .product-card {
              padding: 1.5rem 1.2rem;
            }
            .product-card h3 {
              font-size: 1.6rem;
            }
            .footer-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
          }

          @media (max-width: 480px) {
            .domain-row {
              flex-direction: column;
              align-items: center;
              gap: 0.8rem;
              width: 100%;
              border-radius: 30px;
            }
            .hero h1 {
              font-size: 2.2rem;
            }
            .hero .sub {
              font-size: 1.1rem;
            }
          }
        `}</style>
      </Head>

      <nav>
        <a href="#" className="logo">
          <div className="logo-box"></div>
          ALLSAFEX
        </a>
        <div className="nav-links">
          <a href="#allsafe-access">Allsafe‑Access</a>
          <a href="#allsafe-auth">allsafe‑auth</a>
          <a href="#allsafe-flow">allsafe‑flow</a>
          <a href="#shonet">Shonet RMS</a>
          <a href="#otp">allsafe‑otp</a>
        </div>
      </nav>

      <header className="hero">
        {/* Floating tech icons */}
        <FaShieldAlt className="tech-icon" style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
        <FaServer className="tech-icon" style={{ top: '25%', right: '15%', animationDelay: '1s' }} />
        <FaTerminal className="tech-icon" style={{ bottom: '20%', left: '20%', animationDelay: '2s' }} />
        <FaWifi className="tech-icon" style={{ top: '40%', right: '25%', animationDelay: '1.5s' }} />
        <FaUsers className="tech-icon" style={{ bottom: '30%', right: '10%', animationDelay: '2.5s' }} />
        <FaShieldAlt className="tech-icon" style={{ top: '60%', left: '15%', animationDelay: '0.5s' }} />
        
        <h1>Unified Allsafe‑Access &<br />balanced product ecosystem</h1>
        <p className="sub">PyPI · npm · live domains · all documentation linked</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="domain-row">
            <span className="domain-item">🔵 <a href="https://allsafe-access.allsafex.com" target="_blank" rel="noopener">allsafe‑access.allsafex.com</a></span>
            <span className="domain-item">🟢 <a href="https://shonet.allsafex.com" target="_blank" rel="noopener">shonet.allsafex.com</a></span>
            <span className="domain-item">📦 <a href="https://pypi.org/project/allsafe-auth/" target="_blank" rel="noopener">pypi.org/allsafe-auth</a></span>
            <span className="domain-item">⚙️ <a href="https://www.npmjs.com/package/allsafe-flow" target="_blank" rel="noopener">npmjs/allsafe-flow</a></span>
            <span className="domain-item">🔑 <a href="https://pypi.org/project/allsafe-otp/" target="_blank" rel="noopener">pypi.org/allsafe-otp</a></span>
          </div>
        </div>
      </header>

      <main className="catalog">
        <div className="section-title" id="allsafe-access">🛡️ Allsafe‑Access suite (unified)</div>
        <div className="product-grid">
          <div className="product-card card-allsafe">
            <div className="card-badge">🚪 CENTRAL GATEWAY</div>
            <h3>allsafe‑proxy</h3>
            <div className="product-desc">Secure intermediary: agent management, mTLS, RBAC, audit logs, session relay.</div>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-proxy/overview" target="_blank" rel="noopener" className="primary-link">documentation →</a>
              <span className="pill-tag">core</span>
            </div>
          </div>

          <div className="product-card card-allsafe">
            <div className="card-badge">💻 USER INTERFACE</div>
            <h3>allsafe‑cli</h3>
            <div className="product-desc">Interactive shell, MFA, agent discovery, auto‑completion, session management.</div>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-cli/overview" target="_blank" rel="noopener" className="primary-link">documentation →</a>
            </div>
          </div>

          <div className="product-card card-allsafe">
            <div className="card-badge">📡 REMOTE NODE</div>
            <h3>allsafe‑agent</h3>
            <div className="product-desc">Installed on remote machines, registers with proxy, enables secure shell sessions.</div>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-agent/overview" target="_blank" rel="noopener" className="primary-link">documentation →</a>
            </div>
          </div>

          <div className="product-card card-allsafe">
            <div className="card-badge">🛠️ ADMIN TOOL</div>
            <h3>allsafe‑admin</h3>
            <div className="product-desc">Manage users, active sessions, audit logs, and system configuration.</div>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-admin/overview" target="_blank" rel="noopener" className="primary-link">documentation →</a>
            </div>
          </div>
        </div>

        <div className="section-title" id="allsafe-auth">🔐 allsafe‑auth (PyPI)</div>
        <div className="product-grid">
          <div className="product-card card-allsafe">
            <div className="card-badge">📦 PYPI · v1.1.8</div>
            <h3>allsafe‑auth</h3>
            <div className="product-desc">TOTP, HOTP, Active Directory (LDAP), QR generator, Django + Inertia integration. One library.</div>
            <div className="link-group">
              <a href="https://pypi.org/project/allsafe-auth/" target="_blank" rel="noopener" className="primary-link">PyPI →</a>
              <a href="https://allsafe-access.allsafex.com/docs/auth" target="_blank" rel="noopener" className="external-link">docs</a>
              <span className="pill-tag">MIT</span>
            </div>
            <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#3d6184' }}>maintainer: Daniel Destaw</div>
          </div>
        </div>

        <div className="section-title" id="allsafe-flow">⚙️ allsafe‑flow (npm)</div>
        <div className="product-grid">
          <div className="product-card card-tool">
            <div className="card-badge">⚙️ NPM · v1.1.4</div>
            <h3>allsafe‑flow</h3>
            <div className="product-desc">Declarative service orchestration: YAML, colored logs, health checks, start/stop/restart.</div>
            <div className="link-group">
              <a href="https://www.npmjs.com/package/allsafe-flow" target="_blank" rel="noopener" className="primary-link">npm →</a>
              <a href="https://allsafe-access.allsafex.com/docs/flow" target="_blank" rel="noopener" className="external-link">CLI docs</a>
              <span className="pill-tag">devtools</span>
            </div>
          </div>
        </div>

        <div className="section-title shonet-title" id="shonet">🍽️ Shonet RMS (hospitality)</div>
        <div className="product-grid">
          <div className="product-card card-shonet">
            <div className="card-badge">🏬 WINDOWS POS</div>
            <h3>Shonet Master</h3>
            <div className="product-desc">Zero‑internet POS, offline database, LAN sync to waiter apps.</div>
            <div className="link-group">
              <a href="https://shonet.allsafex.com" target="_blank" rel="noopener" className="primary-link">shonet.allsafex.com →</a>
              <span className="pill-tag">live</span>
            </div>
          </div>
          <div className="product-card card-shonet">
            <div className="card-badge">📱 ANDROID APK</div>
            <h3>Shonet Waiter</h3>
            <div className="product-desc">Order taking, table management, works offline, syncs via LAN.</div>
            <div className="link-group">
              <a href="https://shonet.allsafex.com/waiter" target="_blank" rel="noopener" className="primary-link">download APK →</a>
            </div>
          </div>
          <div className="product-card card-shonet">
            <div className="card-badge">🍳 KITCHEN</div>
            <h3>Kitchen Display</h3>
            <div className="product-desc">Real‑time orders, prep times, no internet needed.</div>
            <div className="link-group">
              <a href="https://shonet.allsafex.com/kitchen" target="_blank" rel="noopener" className="primary-link">view demo</a>
            </div>
          </div>
          <div className="product-card card-shonet">
            <div className="card-badge">📊 REPORTING</div>
            <h3>Analytics Hub</h3>
            <div className="product-desc">Sales, item popularity, export reports — on‑prem.</div>
            <div className="link-group">
              <a href="https://shonet.allsafex.com/analytics" target="_blank" rel="noopener" className="primary-link">insights</a>
            </div>
          </div>
        </div>

        <div className="section-title utility-title" id="otp">🔑 2FA & utilities</div>
        <div className="product-grid">
          <div className="product-card card-tool">
            <div className="card-badge">📀 PYPI · v0.1.1</div>
            <h3>allsafe‑otp</h3>
            <div className="product-desc">Lightweight TOTP + QR generator. Simple 2FA for Python apps.</div>
            <div className="link-group">
              <a href="https://pypi.org/project/allsafe-otp/" target="_blank" rel="noopener" className="primary-link">PyPI</a>
              <a href="#" className="external-link">generate_otp</a>
            </div>
          </div>
          <div className="product-card card-docs">
            <div className="card-badge">📘 DOCS</div>
            <h3>Allsafe Docs</h3>
            <div className="product-desc">Full documentation for all modules: auth, proxy, CLI, agent, flow.</div>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs" target="_blank" rel="noopener" className="primary-link">visit docs</a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', margin: '4rem 0 1rem' }}>
          <a href="https://pypi.org/project/allsafe-auth/" style={{ background: '#1d4ed8', color: 'white', padding: '0.8rem 2.2rem', borderRadius: '60px', textDecoration: 'none', fontWeight: 700 }}>📦 allsafe-auth 1.1.8 (PyPI)</a>
          <a href="https://www.npmjs.com/package/allsafe-flow" style={{ background: '#b45309', color: 'white', padding: '0.8rem 2.2rem', borderRadius: '60px', textDecoration: 'none', fontWeight: 700 }}>⚙️ allsafe-flow 1.1.4 (npm)</a>
          <a href="https://pypi.org/project/allsafe-otp/" style={{ background: '#0f766e', color: 'white', padding: '0.8rem 2.2rem', borderRadius: '60px', textDecoration: 'none', fontWeight: 700 }}>🔑 allsafe-otp 0.1.1</a>
        </div>
      </main>

      <footer>
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo" style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>ALLSAFEX</div>
            <p style={{ color: '#a8c9ff' }}>Balanced product ecosystem — Allsafe‑Access, allsafe‑auth, allsafe‑flow, Shonet RMS.</p>
          </div>
          <div className="footer-col">
            <h5>ALLSAFE‑ACCESS</h5>
            <ul>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-proxy/overview" target="_blank" rel="noopener">allsafe-proxy</a></li>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-cli/overview" target="_blank" rel="noopener">allsafe-cli</a></li>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-agent/overview" target="_blank" rel="noopener">allsafe-agent</a></li>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-admin/overview" target="_blank" rel="noopener">allsafe-admin</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>PACKAGES</h5>
            <ul>
              <li><a href="https://pypi.org/project/allsafe-auth/" target="_blank" rel="noopener">allsafe-auth (PyPI)</a></li>
              <li><a href="https://www.npmjs.com/package/allsafe-flow" target="_blank" rel="noopener">allsafe-flow (npm)</a></li>
              <li><a href="https://pypi.org/project/allsafe-otp/" target="_blank" rel="noopener">allsafe-otp (PyPI)</a></li>
              <li><a href="https://shonet.allsafex.com" target="_blank" rel="noopener">Shonet RMS</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <div className="admin-card">
              <h5 style={{ color: 'white' }}>Principal Engineer</h5>
              <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>Daniel Destaw</span><br />
              <a href="mailto:daniel.destaw@allsafex.com">daniel.destaw@allsafex.com</a>
              <p style={{ marginTop: '1rem' }}>📞 0988886692</p>
              <p style={{ fontSize: '0.8rem', color: '#93b9ff' }}>maintainer of allsafe‑auth & allsafe‑flow</p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#6f9ad0' }}>
          © 2026 Allsafex — all products linked with accurate documentation.
        </div>
      </footer>
    </>
  );
}