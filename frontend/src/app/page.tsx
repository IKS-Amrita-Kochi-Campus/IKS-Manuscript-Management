'use client';

import Link from 'next/link';

// Icon Components
const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="5" rx="2" />
    <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
    <path d="M10 13h4" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Header Component
const Header = () => (
  <header style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 100,
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link href="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 700,
        }}>
          IKS
        </div>
        <span style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#0f172a',
        }}>
          Indigenous Knowledge Systems
        </span>
      </Link>

      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
      }}>
        <Link href="/manuscripts" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#475569',
          textDecoration: 'none',
          transition: 'color 0.15s',
        }}>
          Manuscripts
        </Link>
        <Link href="/about" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#475569',
          textDecoration: 'none',
          transition: 'color 0.15s',
        }}>
          About
        </Link>
        <Link href="/researchers" style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#475569',
          textDecoration: 'none',
          transition: 'color 0.15s',
        }}>
          Researchers
        </Link>
      </nav>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Link href="/login" style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#475569',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          transition: 'all 0.15s',
        }}>
          Sign In
        </Link>
        <Link href="/register" style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'white',
          textDecoration: 'none',
          background: '#059669',
          borderRadius: '0.5rem',
          transition: 'all 0.15s',
        }}>
          Get Started
        </Link>
      </div>
    </div>
  </header>
);

// Stats Card Component
const StatsCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <div style={{
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    transition: 'all 0.2s',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      background: '#ecfdf5',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#0f172a',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: '#64748b',
        marginTop: '0.25rem',
      }}>
        {label}
      </div>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div style={{
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      background: '#f8fafc',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
      marginBottom: '1rem',
    }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#0f172a',
      marginBottom: '0.5rem',
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '0.875rem',
      color: '#64748b',
      lineHeight: 1.6,
      margin: 0,
    }}>
      {description}
    </p>
  </div>
);

// Footer Component
const Footer = () => (
  <footer style={{
    background: '#f8fafc',
    borderTop: '1px solid #e5e7eb',
    padding: '3rem 0',
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
            }}>
              IKS
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
              IKS Platform
            </span>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            lineHeight: 1.6,
          }}>
            Preserving and advancing indigenous knowledge through digital research and collaboration.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Platform
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Manuscripts', 'Research Tools', 'Collaboration', 'API Access'].map((item) => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Resources
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Documentation', 'Research Guides', 'Community', 'Support'].map((item) => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Legal
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Privacy Policy', 'Terms of Service', 'Data Protection', 'Accessibility'].map((item) => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          © {new Date().getFullYear()} Indigenous Knowledge Systems. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
            GitHub
          </Link>
          <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
            Twitter
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

// Main Page Component
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        paddingTop: 'calc(64px + 5rem)',
        paddingBottom: '5rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            background: '#ecfdf5',
            borderRadius: '999px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#059669',
            marginBottom: '1.5rem',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: '#10b981',
              borderRadius: '50%',
            }} />
            Research Platform v2.0
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.15,
            maxWidth: '800px',
            margin: '0 auto 1.5rem',
          }}>
            Digital Archive for<br />
            <span style={{ color: '#059669' }}>Indigenous Knowledge</span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}>
            Explore, preserve, and advance traditional wisdom through modern research methodologies.
            A comprehensive platform for scholars and researchers.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}>
            <Link href="/register" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'white',
              textDecoration: 'none',
              background: '#059669',
              borderRadius: '0.5rem',
              transition: 'all 0.15s',
            }}>
              Start Exploring
              <ArrowRightIcon />
            </Link>
            <Link href="/manuscripts" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#0f172a',
              textDecoration: 'none',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              transition: 'all 0.15s',
            }}>
              Browse Archive
            </Link>
          </div>

          {/* Search Bar */}
          <div style={{
            maxWidth: '600px',
            margin: '3rem auto 0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '0.5rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}>
              <div style={{
                padding: '0 1rem',
                color: '#64748b',
              }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search manuscripts, authors, or topics..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9375rem',
                  color: '#0f172a',
                  background: 'transparent',
                  padding: '0.75rem 0',
                }}
              />
              <button style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'white',
                background: '#059669',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '3rem 0',
        background: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
          }}>
            <StatsCard value="12,450+" label="Manuscripts Archived" icon={<BookIcon />} />
            <StatsCard value="840+" label="Active Researchers" icon={<UsersIcon />} />
            <StatsCard value="156" label="Languages Represented" icon={<GlobeIcon />} />
            <StatsCard value="99.9%" label="Uptime Guarantee" icon={<ShieldIcon />} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 0',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '0.75rem',
            }}>
              Research-Grade Platform
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Built for scholars, archivists, and researchers who need reliable tools for preserving and studying indigenous knowledge.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}>
            <FeatureCard
              icon={<ArchiveIcon />}
              title="Digital Preservation"
              description="High-fidelity digitization and archival of manuscripts with advanced metadata tagging and categorization systems."
            />
            <FeatureCard
              icon={<SearchIcon />}
              title="Advanced Search"
              description="Full-text search across manuscripts with filters for language, period, region, and subject matter."
            />
            <FeatureCard
              icon={<UsersIcon />}
              title="Collaborative Research"
              description="Work together with researchers worldwide. Share annotations, notes, and findings in real-time."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Secure Access"
              description="Role-based permissions ensure sensitive materials are protected while enabling appropriate scholarly access."
            />
            <FeatureCard
              icon={<GlobeIcon />}
              title="Multi-Language Support"
              description="Interface and content available in multiple languages to support global research communities."
            />
            <FeatureCard
              icon={<BookIcon />}
              title="Citation Tools"
              description="Generate citations in various formats. Export references for use in academic papers and publications."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#0f172a',
            marginBottom: '0.75rem',
          }}>
            Ready to Start Your Research?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            maxWidth: '500px',
            margin: '0 auto 2rem',
          }}>
            Join thousands of researchers who trust our platform for their indigenous knowledge research needs.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}>
            <Link href="/register" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'white',
              textDecoration: 'none',
              background: '#059669',
              borderRadius: '0.5rem',
              transition: 'all 0.15s',
            }}>
              Create Free Account
              <ChevronRightIcon />
            </Link>
            <Link href="/contact" style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#059669',
              textDecoration: 'none',
            }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
