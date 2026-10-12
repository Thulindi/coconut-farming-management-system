import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const getContent = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          title: 'Email Verified Successfully!',
          message: 'Your email address has been verified. You can now log in to your CocoSmart account.',
          color: '#16a34a',
          bg: '#f0fdf4',
          border: '#bbf7d0',
        };
      case 'already':
        return {
          icon: '✔️',
          title: 'Already Verified',
          message: 'Your email address was already verified. You can log in to your account.',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
        };
      case 'error':
      default:
        return {
          icon: '❌',
          title: 'Verification Failed',
          message: 'The verification link is invalid or has already been used. Please register again or contact support.',
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#fecaca',
        };
    }
  };

  const content = getContent();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          padding: '3rem 2.5rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          border: `1px solid ${content.border}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🥥</span>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#166534',
              letterSpacing: '-0.5px',
            }}
          >
            CocoSmart
          </span>
        </div>

        {/* Icon */}
        <div
          style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            lineHeight: 1,
          }}
        >
          {content.icon}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: content.color,
            marginBottom: '0.75rem',
          }}
        >
          {content.title}
        </h1>

        {/* Message */}
        <p
          style={{
            color: '#6b7280',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
          }}
        >
          {content.message}
        </p>

        {/* Auto-redirect notice */}
        <p
          style={{
            fontSize: '0.8rem',
            color: '#9ca3af',
            marginBottom: '1.5rem',
          }}
        >
          Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>

        {/* Login button */}
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 2rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
