import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <section style={{
        minHeight: '100vh',
        backgroundImage: 'url(/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Overlay Layer 1 — left-to-right gradient for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,20,10,0.88) 0%, rgba(0,20,10,0.6) 45%, rgba(0,20,10,0.1) 100%)',
          zIndex: 1,
        }} />

        {/* Overlay Layer 2 — bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,15,8,0.7) 100%)',
          zIndex: 1,
        }} />

        {/* FLOATING GLASS NAVBAR */}
        <nav style={{
          position: 'relative', zIndex: 10,
          padding: '20px 32px 0',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '99px',
            padding: '12px 28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '32px',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '17px', fontWeight: 800,
              color: 'white', letterSpacing: '-0.3px',
            }}>NURTILOOP</span>

            {['How it Works', 'Impact', 'About'].map(link => (
              <span key={link} style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.82)',
                cursor: 'pointer',
              }}>{link}</span>
            ))}

            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'white', color: '#16A34A',
                border: 'none', borderRadius: '99px',
                padding: '8px 20px', fontSize: '13px',
                fontWeight: 700, cursor: 'pointer',
              }}>
              Get Started
            </button>
          </div>
        </nav>

        {/* HERO CONTENT — left aligned, max 520px wide */}
        <div style={{
          position: 'relative', zIndex: 10,
          flex: 1, display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
          padding: '60px 48px 80px',
          maxWidth: '580px',
        }}>
          {/* Small pill badge */}
          <div style={{
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '99px',
            padding: '6px 16px',
            fontSize: '12px', fontWeight: 600,
            color: 'white',
            marginBottom: '20px',
            display: 'inline-block', width: 'fit-content',
          }}>
            AI-Powered Food Redistribution
          </div>

          {/* Main headline */}
          <h1 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '60px', fontWeight: 800,
            color: 'white', lineHeight: 1.08,
            letterSpacing: '-2px',
            margin: '0 0 18px',
            textShadow: '0 2px 24px rgba(0,0,0,0.4)',
          }}>
            Turn Surplus<br />
            Into{' '}
            <span style={{ color: '#86EFAC' }}>Smiles</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '17px', fontWeight: 400,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7, maxWidth: '420px',
            margin: '0 0 32px',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}>
            AI-powered food redistribution connecting restaurants with NGOs
            in real-time. Every meal saved is a family fed.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/signup?role=restaurant')}
              style={{
                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                color: 'white', border: 'none',
                borderRadius: '99px', padding: '14px 28px',
                fontSize: '15px', fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(22,163,74,0.5)',
                transition: 'all 0.2s',
              }}>
              🍽 I'm a Restaurant
            </button>

            <button
              onClick={() => navigate('/signup?role=ngo')}
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '99px', padding: '13px 26px',
                fontSize: '15px', fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              🤝 I'm an NGO
            </button>
          </div>

          {/* Stats pill */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '99px',
            padding: '10px 22px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
            display: 'inline-block',
            width: 'fit-content',
          }}>
            12,000+ meals saved &nbsp;•&nbsp; 240+ restaurants &nbsp;•&nbsp; 180+ NGOs &nbsp;•&nbsp; 8 cities
          </div>
        </div>

        {/* Bottom text quote */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '0 48px 28px',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}>
            We connect restaurants with surplus food to nearby NGOs — ensuring every
            meal finds a purpose instead of a bin.
          </p>
        </div>
      </section>

      <section style={{
        background: 'white',
        padding: '80px 48px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          <div style={{
            fontSize: '13px', fontWeight: 600,
            color: '#16A34A', marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>Our Impact</div>
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '36px', fontWeight: 800,
            color: '#111827', letterSpacing: '-0.5px',
          }}>Every number is a life touched</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          maxWidth: '780px',
          margin: '0 auto',
        }}>
          {[
            { icon: '🍽', number: '12,000+', label: 'Meals Saved', color: '#16A34A', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '#BBF7D0' },
            { icon: '🏪', number: '240+', label: 'Restaurant Partners', color: '#F59E0B', bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '#FDE68A' },
            { icon: '🤝', number: '180+', label: 'NGO Partners', color: '#2563EB', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '#BFDBFE' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg,
              borderRadius: '24px',
              padding: '40px 28px',
              textAlign: 'center',
              border: `1.5px solid ${stat.border}`,
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '52px', fontWeight: 800,
                color: stat.color, lineHeight: 1,
                marginBottom: '8px',
              }}>{stat.number}</div>
              <div style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '15px', color: '#6B7280',
                fontWeight: 500,
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        background: '#F0FDF4',
        padding: '100px 48px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 600,
          color: '#16A34A', marginBottom: '8px',
          textTransform: 'uppercase', letterSpacing: '1px',
        }}>Simple Process</div>
        <h2 style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '36px', fontWeight: 800,
          color: '#111827', marginBottom: '12px',
        }}>How It Works</h2>
        <p style={{
          fontSize: '16px', color: '#6B7280',
          marginBottom: '60px', maxWidth: '480px',
          margin: '0 auto 60px', lineHeight: 1.6,
        }}>
          Three simple steps to turn surplus food into smiles
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
        }}>
          {[
            { step: '01', icon: '🍱', iconBg: '#FEF3C7', title: 'Restaurant Posts Surplus', desc: 'Quickly log leftover food with our AI-assisted form. Takes less than 60 seconds.' },
            { step: '02', icon: '📍', iconBg: '#DBEAFE', title: 'NGO Discovers Nearby Food', desc: 'Nearby NGOs get instantly notified and can see listings on a live map.' },
            { step: '03', icon: '✅', iconBg: '#DCFCE7', title: 'Pickup Confirmed', desc: 'The food is picked up and distributed. Impact metrics are automatically tracked.' },
          ].map((step, i) => (
            <div key={step.step} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '36px 24px',
              textAlign: 'center',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              transition: 'all 0.3s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'; }}
            >
              <div style={{
                fontSize: '11px', fontWeight: 700,
                color: '#16A34A', letterSpacing: '1px',
                marginBottom: '16px',
              }}>STEP {step.step}</div>
              <div style={{
                width: '64px', height: '64px',
                background: step.iconBg,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px',
              }}>{step.icon}</div>
              <h3 style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '17px', fontWeight: 700,
                color: '#111827', marginBottom: '10px',
                lineHeight: 1.3,
              }}>{step.title}</h3>
              <p style={{
                fontSize: '14px', color: '#6B7280',
                lineHeight: 1.65,
              }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        background: 'white',
        padding: '100px 48px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            fontSize: '13px', fontWeight: 600,
            color: '#16A34A', marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>Why ZeroWaste AI</div>
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '36px', fontWeight: 800,
            color: '#111827',
          }}>Built for real impact</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          maxWidth: '960px',
          margin: '0 auto',
        }}>
          {[
            { icon: '📍', title: 'Location-Based Matching', desc: 'Haversine algorithm finds the closest NGOs within 10km instantly.', color: '#EFF6FF' },
            { icon: '🤖', title: 'AI Demand Prediction', desc: 'Machine learning predicts surplus quantities before you even post.', color: '#F0FDF4' },
            { icon: '⚡', title: 'Real-Time Notifications', desc: 'NGOs are alerted the moment food is posted nearby.', color: '#FFFBEB' },
            { icon: '📊', title: 'Impact Tracking', desc: 'Every meal saved is counted. Share your impact with donors.', color: '#F0FDF4' },
            { icon: '🔒', title: 'Secure & Verified', desc: 'Firebase authentication with role-based access control.', color: '#FFF1F2' },
            { icon: '📱', title: 'Mobile-First Design', desc: 'Restaurant staff can post surplus in under 60 seconds on any device.', color: '#EFF6FF' },
          ].map(f => (
            <div key={f.title} style={{
              background: f.color,
              borderRadius: '20px',
              padding: '28px 24px',
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '16px', fontWeight: 700,
                color: '#111827', marginBottom: '8px',
              }}>{f.title}</h3>
              <p style={{
                fontSize: '14px', color: '#6B7280',
                lineHeight: 1.65,
              }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        background: 'linear-gradient(135deg, #14532D 0%, #16A34A 60%, #22C55E 100%)',
        padding: '80px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '200px', height: '200px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '40px', fontWeight: 800,
            color: 'white', marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            Ready to fight food waste?
          </h2>
          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.85)',
            marginBottom: '36px', maxWidth: '480px',
            margin: '0 auto 36px', lineHeight: 1.6,
          }}>
            Join 240+ restaurants and 180+ NGOs already making a difference every day.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/signup?role=restaurant')}
              style={{
                background: 'white', color: '#16A34A',
                border: 'none', borderRadius: '99px',
                padding: '15px 32px', fontSize: '16px',
                fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
              }}>
              🍽 Join as Restaurant
            </button>
            <button
              onClick={() => navigate('/signup?role=ngo')}
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '99px', padding: '14px 30px',
                fontSize: '16px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              🤝 Join as NGO — Free
            </button>
          </div>
        </div>
      </section>

      <footer style={{
        background: '#111827',
        padding: '40px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '18px', fontWeight: 800,
            color: '#16A34A', marginBottom: '4px',
          }}>🌱 ZeroWaste AI</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Fighting hunger, one meal at a time.
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#4B5563' }}>
          © 2025 ZeroWaste AI. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['About', 'Privacy', 'Terms', 'Contact'].map(link => (
            <span key={link} style={{
              fontSize: '12px', color: '#6B7280',
              cursor: 'pointer', transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#16A34A'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
            >{link}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
