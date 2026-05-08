import Head from 'next/head';
import Image from 'next/image';
import { 
  FaShieldAlt, FaServer, FaTerminal, FaUsers, FaUtensils, 
  FaWindows, FaAndroid, FaWifi, FaArrowRight, FaDownload,
  FaCheckCircle, FaClock, FaBolt, FaCreditCard, FaChartLine,
  FaPhone, FaEnvelope, FaGithub, FaLinkedin, FaTwitter,
  FaGem, FaRocket, FaCube, FaLayerGroup, FaKey, FaBookOpen,
  FaBrain, FaLock, FaNetworkWired, FaCodeBranch, FaCloud,
  FaGlobe, FaQrcode, FaDatabase, FaPython, FaNpm, FaCalendarAlt,
  FaUsersCog, FaUserShield, FaChartBar, FaMobileAlt, FaCopy,
  FaCode
} from 'react-icons/fa';
import { useState } from 'react';

export default function Home() {
  const [copiedAuth, setCopiedAuth] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedFlow, setCopiedFlow] = useState(false);
  const [expandedCode, setExpandedCode] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'auth') {
      setCopiedAuth(true);
      setTimeout(() => setCopiedAuth(false), 2000);
    } else if (type === 'otp') {
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    } else if (type === 'flow') {
      setCopiedFlow(true);
      setTimeout(() => setCopiedFlow(false), 2000);
    }
  };

  const toggleCode = (id) => {
    setExpandedCode(expandedCode === id ? null : id);
  };

  const totpCodeExample = `from allsafe_auth.authentication.totp import TOTP
from allsafe_auth.utils.qr_code_generator import QRCodeGenerator

if __name__ == "__main__":
    secret_key = "JBSWY3DPEHPK3PXP"
    account_name = "allsafe@example.com"
    issuer_name = "allsafe"
    qr_filename = "totp_qr_code.png"

    totp = TOTP(secret_key)
    print(f"Current TOTP: {totp.generate()}")

    uri = QRCodeGenerator.generate_uri(issuer_name, account_name, secret_key)
    QRCodeGenerator.save_to_file(uri, qr_filename)`;

  const adAuthCodeExample = `from allsafe_auth.authentication.active_directory import ActiveDirectoryAuthenticator

# Configuration
AD_SERVER_IP = "10.195.130.34"
AD_DOMAIN = "allsafe.com.et"
AD_SEARCH_BASE = "DC=allsafe,DC=com,DC=et"

ad_auth = ActiveDirectoryAuthenticator(
    server_ip=AD_SERVER_IP,
    domain=AD_DOMAIN,
    search_base=AD_SEARCH_BASE
)

# Test Authentication
username = input("Enter username: ")
password = input("Enter password: ")

user_data = ad_auth.authenticate(username, password)

if user_data:
    print(" Login successful!")
    print("User Info:", user_data)
else:
    print(" Authentication failed.")`;

  const flowConfigExample = `# Allsafe-flow Configuration (devflow.config.yaml)
services:
  - name: frontend
    command: npm run dev
    cwd: ./frontend
    healthCheck: http://localhost:3000
    color: green
    env:
      PORT: 3000

  - name: backend
    command: python manage.py runserver
    cwd: ./backend
    healthCheck: http://localhost:8000/health
    color: blue
    env:
      DJANGO_ENV: development`;

  const flowCommandsExample = `# Start all services
allsafe-flow start

# Start a specific service
allsafe-flow start backend

# Stop all services
allsafe-flow stop

# Restart a service
allsafe-flow restart frontend

# Check status
allsafe-flow status

# Initialize config file
allsafe-flow init`;

  const otpSimpleExample = `from allsafe_otp.totp import generate_otp
from allsafe_otp.generate_qr import generate_qr_code

# Generate a TOTP code
secret = "JBSWY3DPEHPK3PXP"
otp = generate_otp(secret)
print(f"Generated OTP: {otp}")

# Generate QR code for Google Authenticator
otp_url = "otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp"
generate_qr_code(otp_url)`;

  return (
    <>
      <Head>
        <title>Allsafex · Cybersecurity & AI Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/assets/logo.png" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --bg-dark: #0a0a0a;
            --bg-card: #111111;
            --bg-elevated: #1a1a1a;
            --orange-primary: #ff6b35;
            --orange-glow: #ff8c42;
            --orange-dark: #e85d04;
            --orange-soft: #ffb347;
            --purple-accent: #a855f7;
            --text-white: #ffffff;
            --text-gray: #a0a0a0;
            --text-dim: #6b6b6b;
            --border-glow: rgba(255, 107, 53, 0.3);
            --shadow-glow: 0 0 30px rgba(255, 107, 53, 0.2);
            --shadow-glow-hover: 0 0 50px rgba(255, 107, 53, 0.4);
            --radius-sm: 12px;
            --radius-md: 20px;
            --radius-lg: 28px;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-dark);
            color: var(--text-white);
            line-height: 1.5;
            overflow-x: hidden;
          }

          html {
            scroll-behavior: smooth;
          }

          nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 107, 53, 0.2);
            height: 85px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8%;
            z-index: 1000;
            transition: all 0.3s;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }
          .logo-image {
            position: relative;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-image img {
            object-fit: contain;
          }
          .logo-text {
            font-size: 1.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--orange-primary), var(--orange-glow));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .nav-links {
            display: flex;
            gap: 2.8rem;
            align-items: center;
          }
          .nav-links a {
            color: var(--text-gray);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s;
            position: relative;
          }
          .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--orange-primary);
            transition: width 0.2s;
          }
          .nav-links a:hover {
            color: var(--orange-primary);
          }
          .nav-links a:hover::after {
            width: 100%;
          }

          .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
            overflow: hidden;
            padding: 120px 5% 80px;
          }

          .hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(ellipse at 30% 40%, rgba(255,107,53,0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(255,140,66,0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.08) 0%, transparent 60%);
            pointer-events: none;
          }

          .hero-content {
            position: relative;
            z-index: 2;
            max-width: 1000px;
            margin: 0 auto;
          }

          .hero-badge {
            display: inline-block;
            background: rgba(255, 107, 53, 0.15);
            border: 1px solid rgba(255, 107, 53, 0.3);
            padding: 8px 20px;
            border-radius: 100px;
            font-size: 0.85rem;
            color: var(--orange-glow);
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
          }

          .hero-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
          }
          .hero-logo-image {
            position: relative;
            width: 100px;
            height: 100px;
          }

          .hero h1 {
            font-size: clamp(2.8rem, 7vw, 5rem);
            font-weight: 800;
            letter-spacing: -2px;
            line-height: 1.2;
            margin-bottom: 25px;
            background: linear-gradient(135deg, #fff, var(--orange-soft), var(--purple-accent));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .hero .sub {
            font-size: 1.2rem;
            color: var(--text-gray);
            max-width: 800px;
            margin: 0 auto 35px;
            line-height: 1.6;
          }

          .domain-strip {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            margin-top: 40px;
          }

          .domain-chip {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 107, 53, 0.2);
            padding: 10px 20px;
            border-radius: 100px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .domain-chip a {
            color: var(--text-gray);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: color 0.2s;
          }
          .domain-chip:hover {
            border-color: var(--orange-primary);
            background: rgba(255, 107, 53, 0.1);
          }
          .domain-chip:hover a {
            color: var(--orange-primary);
          }
          .domain-icon {
            font-size: 0.85rem;
            color: var(--orange-glow);
          }

          .particle {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, var(--orange-primary), transparent);
            opacity: 0.4;
            animation: floatParticle 8s infinite;
            pointer-events: none;
          }

          @keyframes floatParticle {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
            50% { transform: translateY(-30px) translateX(20px); opacity: 0.6; }
          }

          .catalog {
            max-width: 1400px;
            margin: 0 auto 80px;
            padding: 0 30px;
          }

          .section-header {
            text-align: center;
            margin-bottom: 60px;
          }
          .section-tag {
            display: inline-block;
            background: linear-gradient(135deg, var(--orange-primary), var(--orange-glow));
            padding: 5px 15px;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          .section-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: -1px;
            background: linear-gradient(135deg, #fff, var(--orange-soft));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .section-header p {
            color: var(--text-gray);
            margin-top: 15px;
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 2rem;
          }

          .product-card {
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            padding: 2rem;
            border: 1px solid rgba(255, 107, 53, 0.15);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .product-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--orange-primary), var(--orange-glow), transparent);
            transform: scaleX(0);
            transition: transform 0.3s;
          }
          .product-card:hover {
            transform: translateY(-8px);
            border-color: rgba(255, 107, 53, 0.4);
            box-shadow: var(--shadow-glow);
          }
          .product-card:hover::before {
            transform: scaleX(1);
          }

          .card-icon {
            font-size: 2.5rem;
            color: var(--orange-primary);
            margin-bottom: 1.5rem;
          }
          .card-badge {
            font-size: 0.65rem;
            font-weight: 600;
            letter-spacing: 1px;
            color: var(--orange-glow);
            text-transform: uppercase;
            margin-bottom: 0.8rem;
          }
          .product-card h3 {
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 0.75rem;
          }
          .product-desc {
            color: var(--text-gray);
            margin: 0.5rem 0 1rem;
            font-size: 0.9rem;
            line-height: 1.5;
          }
          .feature-list {
            margin: 1rem 0 1.2rem;
            padding-left: 1.2rem;
          }
          .feature-list li {
            color: var(--text-dim);
            font-size: 0.8rem;
            margin-bottom: 0.4rem;
            list-style-type: none;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .feature-list li svg {
            color: var(--orange-glow);
            font-size: 0.7rem;
          }
          .install-command {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 12px;
            padding: 0.8rem 1rem;
            margin: 1rem 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid rgba(255, 107, 53, 0.3);
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.8rem;
          }
          .install-command code {
            color: var(--orange-glow);
          }
          .copy-btn {
            background: rgba(255, 107, 53, 0.2);
            border: none;
            color: var(--orange-glow);
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.7rem;
          }
          .copy-btn:hover {
            background: rgba(255, 107, 53, 0.4);
          }
          .copied-badge {
            background: #10b981;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
            font-size: 0.65rem;
          }
          .code-example {
            margin-top: 1rem;
            border-top: 1px solid rgba(255, 107, 53, 0.2);
            padding-top: 1rem;
          }
          .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            padding: 0.5rem 0;
            color: var(--orange-glow);
            font-size: 0.8rem;
            font-weight: 500;
          }
          .code-header:hover {
            color: var(--orange-primary);
          }
          .code-content {
            background: #0a0a0a;
            border-radius: 12px;
            padding: 1rem;
            margin-top: 0.5rem;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.7rem;
            color: #d4d4d4;
            white-space: pre-wrap;
            word-break: break-all;
            border: 1px solid rgba(255, 107, 53, 0.2);
          }
          .code-content code {
            display: block;
          }
          .link-group {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 1rem;
            align-items: center;
          }
          .link-group a {
            text-decoration: none;
            font-weight: 500;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          }
          .primary-link {
            color: var(--orange-primary);
          }
          .primary-link:hover {
            color: var(--orange-glow);
            gap: 10px;
          }
          .pill-tag {
            background: rgba(255, 107, 53, 0.15);
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 500;
            color: var(--orange-glow);
          }
          .version-info {
            font-size: 0.7rem;
            color: var(--text-dim);
            margin-top: 0.8rem;
            padding-top: 0.8rem;
            border-top: 1px solid rgba(255, 107, 53, 0.2);
          }

          .cta-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem;
            justify-content: center;
            margin: 4rem 0 2rem;
          }
          .cta-button {
            padding: 1rem 2.2rem;
            border-radius: 100px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }
          .cta-primary {
            background: linear-gradient(135deg, var(--orange-primary), var(--orange-dark));
            color: white;
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
          }
          .cta-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 30px rgba(255, 107, 53, 0.6);
          }
          .cta-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 107, 53, 0.3);
            color: var(--text-white);
          }
          .cta-secondary:hover {
            border-color: var(--orange-primary);
            background: rgba(255, 107, 53, 0.1);
          }

          footer {
            background: var(--bg-elevated);
            padding: 70px 8% 30px;
            border-top: 1px solid rgba(255, 107, 53, 0.2);
            margin-top: 60px;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.8fr;
            gap: 3rem;
            padding-bottom: 3rem;
          }
          .footer-col h5 {
            color: var(--orange-glow);
            font-size: 0.8rem;
            letter-spacing: 1.5px;
            margin-bottom: 1.5rem;
          }
          .footer-col ul {
            list-style: none;
          }
          .footer-col li {
            margin-bottom: 0.8rem;
          }
          .footer-col a {
            color: var(--text-gray);
            text-decoration: none;
            transition: color 0.2s;
            font-size: 0.9rem;
          }
          .footer-col a:hover {
            color: var(--orange-primary);
          }
          .footer-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 1rem;
          }
          .footer-logo-image {
            position: relative;
            width: 45px;
            height: 45px;
          }
          .footer-logo-text {
            font-size: 1.6rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--orange-primary), var(--orange-glow));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .admin-card {
            background: rgba(255, 107, 53, 0.05);
            padding: 1.5rem;
            border-radius: var(--radius-md);
            border-left: 3px solid var(--orange-primary);
          }
          .admin-card span {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--orange-glow);
          }

          @media (max-width: 768px) {
            .nav-links { display: none; }
            .product-grid { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
            .hero h1 { font-size: 2.5rem; }
            .catalog { padding: 0 20px; }
            .section-header h2 { font-size: 1.8rem; }
            .domain-strip { flex-direction: column; align-items: center; }
          }

          @media (max-width: 480px) {
            .hero h1 { font-size: 2rem; }
            .hero .sub { font-size: 1rem; }
          }
        `}</style>
      </Head>

      <nav>
        <a href="#" className="logo">
          <div className="logo-image">
            <Image src="/assets/logo.png" alt="Allsafex Logo" width={42} height={42} priority />
          </div>
          <span className="logo-text">ALLSAFEX</span>
        </a>
        <div className="nav-links">
          <a href="#allsafe-access">Access Suite</a>
          <a href="#allsafe-auth">allsafe-auth</a>
          <a href="#allsafe-flow">allsafe-flow</a>
          <a href="#shonet">Shonet RMS</a>
          <a href="#otp">allsafe-otp</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg"></div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: Math.random() * 120 + 40,
            height: Math.random() * 120 + 40,
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: Math.random() * 12 + 6 + 's'
          }}></div>
        ))}
        <div className="hero-content">
          <div className="hero-logo">
            <div className="hero-logo-image">
              <Image src="/assets/logo.png" alt="Allsafex Logo" width={100} height={100} priority />
            </div>
          </div>
          <div className="hero-badge">
            <FaRocket style={{ marginRight: '8px' }} /> Open Source · Secure · Intelligent
          </div>
          <h1>The Platform for Cybersecurity<br />and AI Solutions</h1>
          <p className="sub">A platform delivering open-source cybersecurity and AI solutions across multiple domains.</p>
          <div className="domain-strip">
            <div className="domain-chip"><FaGlobe className="domain-icon" /><a href="https://allsafe-access.allsafex.com" target="_blank">allsafe-access.allsafex.com</a></div>
            <div className="domain-chip"><FaUtensils className="domain-icon" /><a href="https://shonet.allsafex.com" target="_blank">shonet.allsafex.com</a></div>
            <div className="domain-chip"><FaPython className="domain-icon" /><a href="https://pypi.org/project/allsafe-auth/" target="_blank">allsafe-auth (PyPI)</a></div>
            <div className="domain-chip"><FaNpm className="domain-icon" /><a href="https://www.npmjs.com/package/allsafe-flow" target="_blank">allsafe-flow (npm)</a></div>
            <div className="domain-chip"><FaLock className="domain-icon" /><a href="https://pypi.org/project/allsafe-otp/" target="_blank">allsafe-otp</a></div>
          </div>
        </div>
      </section>

      <main className="catalog">
        {/* Allsafe-Access Suite */}
        <div className="section-header" id="allsafe-access">
          <div className="section-tag">CORE PLATFORM</div>
          <h2>Allsafe‑Access Suite</h2>
          <p>Zero-trust remote access · Secure infrastructure · Agent-based architecture</p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <FaShieldAlt className="card-icon" />
            <div className="card-badge">CENTRAL GATEWAY</div>
            <h3>allsafe‑proxy</h3>
            <div className="product-desc">Secure intermediary for all remote connections with enterprise-grade security features.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Agent management & registration</li>
              <li><FaCheckCircle /> mTLS encryption for all communications</li>
              <li><FaCheckCircle /> Role-Based Access Control (RBAC)</li>
              <li><FaCheckCircle /> Comprehensive audit logging</li>
              <li><FaCheckCircle /> Session relay & management</li>
            </ul>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-proxy/overview" target="_blank" className="primary-link">documentation →</a>
              <span className="pill-tag">core infrastructure</span>
            </div>
          </div>

          <div className="product-card">
            <FaTerminal className="card-icon" />
            <div className="card-badge">USER INTERFACE</div>
            <h3>allsafe‑cli</h3>
            <div className="product-desc">Powerful command-line interface for secure remote access management.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Interactive shell with auto-completion</li>
              <li><FaCheckCircle /> Built-in MFA support</li>
              <li><FaCheckCircle /> Agent discovery & management</li>
              <li><FaCheckCircle /> Session management & history</li>
              <li><FaCheckCircle /> Cross-platform compatibility</li>
            </ul>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-cli/overview" target="_blank" className="primary-link">documentation →</a>
            </div>
          </div>

          <div className="product-card">
            <FaServer className="card-icon" />
            <div className="card-badge">REMOTE NODE</div>
            <h3>allsafe‑agent</h3>
            <div className="product-desc">Lightweight agent installed on remote machines for secure connectivity.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Automatic registration with proxy</li>
              <li><FaCheckCircle /> Encrypted shell sessions</li>
              <li><FaCheckCircle /> Low resource footprint</li>
              <li><FaCheckCircle /> Self-healing connectivity</li>
              <li><FaCheckCircle /> Multi-platform support</li>
            </ul>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-agent/overview" target="_blank" className="primary-link">documentation →</a>
            </div>
          </div>

          <div className="product-card">
            <FaUsers className="card-icon" />
            <div className="card-badge">ADMIN TOOL</div>
            <h3>allsafe‑admin</h3>
            <div className="product-desc">Centralized management console for administrators.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> User & permission management</li>
              <li><FaCheckCircle /> Real-time session monitoring</li>
              <li><FaCheckCircle /> Audit log viewer & exporter</li>
              <li><FaCheckCircle /> System configuration dashboard</li>
              <li><FaCheckCircle /> Security policy enforcement</li>
            </ul>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs/allsafe-admin/overview" target="_blank" className="primary-link">documentation →</a>
            </div>
          </div>
        </div>

        {/* allsafe-auth */}
        <div className="section-header" id="allsafe-auth" style={{ marginTop: '80px' }}>
          <div className="section-tag">AUTHENTICATION</div>
          <h2>allsafe‑auth</h2>
          <p>Complete authentication library · TOTP · HOTP · Active Directory · Django ready</p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <FaKey className="card-icon" />
            <div className="card-badge">PYPI PACKAGE · v1.1.8</div>
            <h3>allsafe‑auth</h3>
            <div className="product-desc">A complete authentication library including TOTP, HOTP, Active Directory, QR generation, and Django + Inertia integration.</div>
            <div className="install-command">
              <code><FaPython style={{ marginRight: '8px' }} /> pip install allsafe-auth</code>
              <button className="copy-btn" onClick={() => copyToClipboard('pip install allsafe-auth', 'auth')}>
                {copiedAuth ? <span className="copied-badge">Copied!</span> : <><FaCopy /> Copy</>}
              </button>
            </div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Active Directory (LDAP) Authentication</li>
              <li><FaCheckCircle /> HOTP / TOTP Multi-Factor Authentication</li>
              <li><FaCheckCircle /> QR Code Generation for MFA Setup</li>
              <li><FaCheckCircle /> User Listing & Management from AD</li>
              <li><FaCheckCircle /> Django + Inertia.js Integration</li>
              <li><FaCheckCircle /> MIT Licensed · Python {">="} 3.6</li>
            </ul>
            <div className="code-example">
              <div className="code-header" onClick={() => toggleCode('totp')}>
                <FaCode /> TOTP — Generate QR Code for MFA Setup
                <span>{expandedCode === 'totp' ? '▼' : '▶'}</span>
              </div>
              {expandedCode === 'totp' && (
                <div className="code-content">
                  <code>{totpCodeExample}</code>
                </div>
              )}
            </div>
            <div className="code-example">
              <div className="code-header" onClick={() => toggleCode('ad')}>
                <FaCode /> Active Directory Authentication + List Users
                <span>{expandedCode === 'ad' ? '▼' : '▶'}</span>
              </div>
              {expandedCode === 'ad' && (
                <div className="code-content">
                  <code>{adAuthCodeExample}</code>
                </div>
              )}
            </div>
            <div className="link-group">
              <a href="https://pypi.org/project/allsafe-auth/" target="_blank" className="primary-link">PyPI →</a>
              <a href="https://allsafe-access.allsafex.com/docs/auth" target="_blank" className="primary-link">docs →</a>
              <span className="pill-tag">MIT License</span>
            </div>
            <div className="version-info">
              <FaCalendarAlt style={{ marginRight: '6px' }} /> Released: Jul 4, 2025 · Maintainer: Daniel Destaw
            </div>
          </div>
        </div>

        {/* allsafe-flow */}
        <div className="section-header" id="allsafe-flow" style={{ marginTop: '80px' }}>
          <div className="section-tag">ORCHESTRATION</div>
          <h2>allsafe‑flow</h2>
          <p>Declarative service orchestration · YAML configuration · Health checks</p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <FaChartLine className="card-icon" />
            <div className="card-badge">NPM PACKAGE · v1.1.4</div>
            <h3>allsafe‑flow</h3>
            <div className="product-desc">Define and manage your development services using a simple YAML configuration file with color-coded logs and health checks.</div>
            <div className="install-command">
              <code><FaNpm style={{ marginRight: '8px' }} /> npm install -g allsafe-flow</code>
              <button className="copy-btn" onClick={() => copyToClipboard('npm install -g allsafe-flow', 'flow')}>
                {copiedFlow ? <span className="copied-badge">Copied!</span> : <><FaCopy /> Copy</>}
              </button>
            </div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Declarative YAML service configuration</li>
              <li><FaCheckCircle /> Color-coded logs per service</li>
              <li><FaCheckCircle /> HTTP health check endpoints</li>
              <li><FaCheckCircle /> Environment variable support</li>
              <li><FaCheckCircle /> Start/stop/restart individual or all services</li>
              <li><FaCheckCircle /> Real-time status monitoring</li>
            </ul>
            <div className="code-example">
              <div className="code-header" onClick={() => toggleCode('flow-config')}>
                <FaCode /> Example Configuration (devflow.config.yaml)
                <span>{expandedCode === 'flow-config' ? '▼' : '▶'}</span>
              </div>
              {expandedCode === 'flow-config' && (
                <div className="code-content">
                  <code>{flowConfigExample}</code>
                </div>
              )}
            </div>
            <div className="code-example">
              <div className="code-header" onClick={() => toggleCode('flow-cmds')}>
                <FaCode /> Command Line Reference
                <span>{expandedCode === 'flow-cmds' ? '▼' : '▶'}</span>
              </div>
              {expandedCode === 'flow-cmds' && (
                <div className="code-content">
                  <code>{flowCommandsExample}</code>
                </div>
              )}
            </div>
            <div className="link-group">
              <a href="https://www.npmjs.com/package/allsafe-flow" target="_blank" className="primary-link">npm →</a>
              <a href="https://allsafe-access.allsafex.com/docs/flow" target="_blank" className="primary-link">CLI docs →</a>
              <span className="pill-tag">devtools</span>
            </div>
            <div className="version-info">
              <FaCalendarAlt style={{ marginRight: '6px' }} /> Published: 10 months ago · Weekly Downloads: 32 · MIT License
            </div>
          </div>
        </div>

        {/* Shonet RMS */}
        <div className="section-header" id="shonet" style={{ marginTop: '80px' }}>
          <div className="section-tag">HOSPITALITY</div>
          <h2>Shonet RMS</h2>
          <p>Zero‑internet POS · Offline-first · Complete restaurant management</p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <FaWindows className="card-icon" />
            <div className="card-badge">WINDOWS POS</div>
            <h3>Shonet Master</h3>
            <div className="product-desc">Complete POS system that works without internet, with offline database and LAN sync.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Zero-internet operation</li>
              <li><FaCheckCircle /> Offline database with full integrity</li>
              <li><FaCheckCircle /> LAN synchronization to waiter apps</li>
              <li><FaCheckCircle /> Complete transaction history</li>
            </ul>
            <div className="link-group">
              <a href="https://shonet.allsafex.com" target="_blank" className="primary-link">shonet.allsafex.com →</a>
              <span className="pill-tag">live</span>
            </div>
          </div>
          <div className="product-card">
            <FaAndroid className="card-icon" />
            <div className="card-badge">ANDROID APK</div>
            <h3>Shonet Waiter</h3>
            <div className="product-desc">Mobile ordering app for waitstaff with offline capabilities and table management.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Order taking & modification</li>
              <li><FaCheckCircle /> Table visualization & management</li>
              <li><FaCheckCircle /> Works completely offline</li>
              <li><FaCheckCircle /> LAN sync with Master POS</li>
            </ul>
            <div className="link-group">
              <a href="https://shonet.allsafex.com/waiter" target="_blank" className="primary-link">download APK →</a>
            </div>
          </div>
          <div className="product-card">
            <FaUtensils className="card-icon" />
            <div className="card-badge">KITCHEN DISPLAY</div>
            <h3>Kitchen Display</h3>
            <div className="product-desc">Real-time order management for kitchen staff with prep time tracking.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Real-time order display</li>
              <li><FaCheckCircle /> Prep time tracking</li>
              <li><FaCheckCircle /> Order status updates</li>
              <li><FaCheckCircle /> No internet required</li>
            </ul>
            <div className="link-group">
              <a href="https://shonet.allsafex.com/kitchen" target="_blank" className="primary-link">view demo</a>
            </div>
          </div>
          <div className="product-card">
            <FaChartBar className="card-icon" />
            <div className="card-badge">REPORTING HUB</div>
            <h3>Analytics Hub</h3>
            <div className="product-desc">Comprehensive analytics and reporting for restaurant operations.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Sales analysis & trends</li>
              <li><FaCheckCircle /> Item popularity reports</li>
              <li><FaCheckCircle /> Export to multiple formats</li>
              <li><FaCheckCircle /> On-premise data storage</li>
            </ul>
            <div className="link-group">
              <a href="https://shonet.allsafex.com/analytics" target="_blank" className="primary-link">insights</a>
            </div>
          </div>
        </div>

        {/* allsafe-otp */}
        <div className="section-header" id="otp" style={{ marginTop: '80px' }}>
          <div className="section-tag">SECURITY</div>
          <h2>allsafe‑otp</h2>
          <p>Lightweight TOTP · QR Code Generator · Simple 2FA for Python apps</p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <FaQrcode className="card-icon" />
            <div className="card-badge">PYPI PACKAGE · v0.1.1</div>
            <h3>allsafe‑otp</h3>
            <div className="product-desc">A simple Python package for generating Time-Based One-Time Passwords (TOTP) and QR codes for two-factor authentication.</div>
            <div className="install-command">
              <code><FaPython style={{ marginRight: '8px' }} /> pip install allsafe-otp</code>
              <button className="copy-btn" onClick={() => copyToClipboard('pip install allsafe-otp', 'otp')}>
                {copiedOtp ? <span className="copied-badge">Copied!</span> : <><FaCopy /> Copy</>}
              </button>
            </div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Generate secure TOTP codes (HMAC-SHA1)</li>
              <li><FaCheckCircle /> Create scannable QR codes for Google Authenticator</li>
              <li><FaCheckCircle /> Easy integration into Python projects</li>
              <li><FaCheckCircle /> MIT Licensed · Python {">="} 3.6</li>
            </ul>
            <div className="code-example">
              <div className="code-header" onClick={() => toggleCode('otp-simple')}>
                <FaCode /> Simple OTP + QR Code Example
                <span>{expandedCode === 'otp-simple' ? '▼' : '▶'}</span>
              </div>
              {expandedCode === 'otp-simple' && (
                <div className="code-content">
                  <code>{otpSimpleExample}</code>
                </div>
              )}
            </div>
            <div className="link-group">
              <a href="https://pypi.org/project/allsafe-otp/" target="_blank" className="primary-link">PyPI →</a>
              <span className="pill-tag">2FA</span>
            </div>
            <div className="version-info">
              <FaCalendarAlt style={{ marginRight: '6px' }} /> Released: May 7, 2025 · Maintainer: Daniel Destaw
            </div>
          </div>
          <div className="product-card">
            <FaBookOpen className="card-icon" />
            <div className="card-badge">DOCUMENTATION</div>
            <h3>Allsafe Docs</h3>
            <div className="product-desc">Complete documentation for all Allsafex modules including auth, proxy, CLI, agent, flow, and OTP.</div>
            <ul className="feature-list">
              <li><FaCheckCircle /> Getting started guides</li>
              <li><FaCheckCircle /> API references</li>
              <li><FaCheckCircle /> Integration tutorials</li>
              <li><FaCheckCircle /> Code examples & snippets</li>
            </ul>
            <div className="link-group">
              <a href="https://allsafe-access.allsafex.com/docs" target="_blank" className="primary-link">visit docs →</a>
            </div>
          </div>
        </div>

        <div className="cta-container">
          <a href="https://pypi.org/project/allsafe-auth/" target="_blank" className="cta-button cta-primary">
            <FaPython /> allsafe-auth 1.1.8
          </a>
          <a href="https://www.npmjs.com/package/allsafe-flow" target="_blank" className="cta-button cta-secondary">
            <FaNpm /> allsafe-flow 1.1.4
          </a>
          <a href="https://pypi.org/project/allsafe-otp/" target="_blank" className="cta-button cta-secondary">
            <FaDownload /> allsafe-otp 0.1.1
          </a>
        </div>
      </main>

      <footer>
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <div className="footer-logo-image">
                <Image src="/assets/logo.png" alt="Allsafex Logo" width={45} height={45} />
              </div>
              <span className="footer-logo-text">ALLSAFEX</span>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>A platform delivering open-source cybersecurity and AI solutions across multiple domains.</p>
          </div>
          <div className="footer-col">
            <h5>ALLSAFE‑ACCESS</h5>
            <ul>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-proxy/overview" target="_blank">allsafe-proxy</a></li>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-cli/overview" target="_blank">allsafe-cli</a></li>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-agent/overview" target="_blank">allsafe-agent</a></li>
              <li><a href="https://allsafe-access.allsafex.com/docs/allsafe-admin/overview" target="_blank">allsafe-admin</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>PACKAGES</h5>
            <ul>
              <li><a href="https://pypi.org/project/allsafe-auth/" target="_blank">allsafe-auth (PyPI)</a></li>
              <li><a href="https://www.npmjs.com/package/allsafe-flow" target="_blank">allsafe-flow (npm)</a></li>
              <li><a href="https://pypi.org/project/allsafe-otp/" target="_blank">allsafe-otp (PyPI)</a></li>
              <li><a href="https://shonet.allsafex.com" target="_blank">Shonet RMS</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <div className="admin-card">
              <h5 style={{ color: 'var(--orange-glow)' }}>PRINCIPAL ENGINEER</h5>
              <span>Daniel Destaw</span><br />
              <a href="mailto:daniel.destaw@allsafex.com" style={{ fontSize: '0.85rem' }}>daniel.destaw@allsafex.com</a>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>📞 0988886692</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>maintainer of allsafe‑auth & allsafe‑flow</p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          © 2026 Allsafex — Open-source cybersecurity and AI infrastructure
        </div>
      </footer>
    </>
  );
}