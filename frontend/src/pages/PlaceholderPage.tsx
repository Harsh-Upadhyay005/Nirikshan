import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: React.ReactNode
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          {icon}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: '#fff7ed',
          borderRadius: '20px',
          marginBottom: '16px'
        }}>
          <Construction size={16} color="#f97316" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f97316' }}>
            UNDER CONSTRUCTION
          </span>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          color: '#1e293b',
          marginBottom: '12px',
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          {description}
        </p>

        <div style={{
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
            Coming Soon:
          </div>
          <ul style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: 1.8,
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>Real-time data integration</li>
            <li>Advanced filtering and search</li>
            <li>Interactive visualizations</li>
            <li>Export and reporting features</li>
            <li>Role-based access controls</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fef3c7'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
            <strong>Note:</strong> This module is currently in development. The main Dashboard provides comprehensive infrastructure monitoring capabilities. Check back soon for this feature!
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '32px',
        fontSize: '12px',
        color: '#94a3b8',
        textAlign: 'center'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '4px' }}>
          Ministry of Statistics and Programme Implementation
        </div>
        <div>Government of India</div>
      </div>
    </div>
  )
}
