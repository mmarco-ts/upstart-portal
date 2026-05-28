import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Wallet,
  Percent,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import Header from '../components/Header';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Header
        title="Capital Partner Portal"
        subtitle="Your Upstart-originated loan portfolio, end-to-end"
      />
      <main className="main-content home-main">
        <section className="home-hero">
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">Apply your capital with confidence</div>
            <h1 className="home-hero-title">
              Originations, pricing, and yield<br />in one workspace.
            </h1>
            <p className="home-hero-subtitle">
              Funnel, approval and delinquency trends, APR by risk grade, fair-lending
              segmentation — instant answers across loans, applications, and repayments.
            </p>
            <div className="home-hero-actions">
              <button className="home-hero-cta" onClick={() => navigate('/dashboard')}>
                Open Lending Performance <ArrowRight size={18} />
              </button>
              <button className="home-hero-link" onClick={() => navigate('/ai-analytics')}>
                Ask Insights AI <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-hero-card primary">
              <div className="home-hero-card-label">Loans Originated · QTD</div>
              <div className="home-hero-card-value">42,318</div>
              <div className="home-hero-card-delta up">+12.4% vs prior quarter</div>
            </div>
            <div className="home-hero-card">
              <div className="home-hero-card-label">Avg APR</div>
              <div className="home-hero-card-value">14.8%</div>
              <div className="home-hero-card-delta neutral">Personal · Risk B</div>
            </div>
            <div className="home-hero-card">
              <div className="home-hero-card-label">30-Day Delinquency</div>
              <div className="home-hero-card-value">2.1%</div>
              <div className="home-hero-card-delta down">−0.3 pp QoQ</div>
            </div>
          </div>
        </section>

        <section className="home-stats">
          <div className="home-stat-card">
            <div className="home-stat-icon-wrapper"><Wallet size={24} /></div>
            <div className="home-stat-content">
              <span className="home-stat-value">$3.2B</span>
              <span className="home-stat-label">Capital deployed YTD</span>
            </div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon-wrapper"><TrendingUp size={24} /></div>
            <div className="home-stat-content">
              <span className="home-stat-value">37.6%</span>
              <span className="home-stat-label">Approval rate · 12 mo</span>
            </div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon-wrapper"><Percent size={24} /></div>
            <div className="home-stat-content">
              <span className="home-stat-value">14.8%</span>
              <span className="home-stat-label">Avg APR across products</span>
            </div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon-wrapper"><ShieldCheck size={24} /></div>
            <div className="home-stat-content">
              <span className="home-stat-value">2.1%</span>
              <span className="home-stat-label">30-day delinquency</span>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-eyebrow">Get started</div>
          <h2 className="home-section-title">Explore your portfolio</h2>
          <p className="home-section-subtitle">
            Jump into the Lending Performance liveboard or ask Insights AI a question in plain English.
          </p>
          <div className="home-cards-row">
            <button className="home-card" onClick={() => navigate('/dashboard')}>
              <div className="home-card-icon"><LayoutDashboard size={22} /></div>
              <div className="home-card-content">
                <h3>Lending Performance</h3>
                <p>Originations, approval rates, APR, delinquency, and acquisition channel mix.</p>
              </div>
            </button>
            <button className="home-card" onClick={() => navigate('/ai-analytics')}>
              <div className="home-card-icon"><Sparkles size={22} /></div>
              <div className="home-card-content">
                <h3>Insights AI</h3>
                <p>Ask natural-language questions about loans, applications, and repayment trends.</p>
              </div>
            </button>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-eyebrow">Capabilities</div>
          <h2 className="home-section-title">Built for capital partners</h2>
          <p className="home-section-subtitle">
            Designed around the questions institutional investors actually ask Upstart.
          </p>
          <div className="home-cards-row-three">
            <div className="home-card-small">
              <div className="home-card-icon"><Wallet size={22} /></div>
              <div className="home-card-content">
                <h3>Originations &amp; Funnel</h3>
                <p>Loan count, application volume, approval and conversion rates, time-to-fund.</p>
              </div>
            </div>
            <div className="home-card-small">
              <div className="home-card-icon"><Percent size={22} /></div>
              <div className="home-card-content">
                <h3>Pricing &amp; Risk</h3>
                <p>APR by product and risk grade, distribution by credit band, fair-lending proxies.</p>
              </div>
            </div>
            <div className="home-card-small">
              <div className="home-card-icon"><ShieldCheck size={22} /></div>
              <div className="home-card-content">
                <h3>Delinquency &amp; Yield</h3>
                <p>30/60/90 day delinquency by vintage. Repayment performance and cash collected.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
