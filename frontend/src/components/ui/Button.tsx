import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    disabled,
    style,
    ...props
}) => {
    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 500,
        borderRadius: '0.5rem',
        border: '1px solid transparent',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled || loading ? 0.6 : 1,
        whiteSpace: 'nowrap',
    };

    const sizeStyles = {
        sm: { height: '32px', padding: '0.25rem 0.75rem', fontSize: '0.8125rem' },
        md: { height: '40px', padding: '0.5rem 1rem', fontSize: '0.875rem' },
        lg: { height: '48px', padding: '0.75rem 1.5rem', fontSize: '1rem' },
    };

    const variantStyles = {
        primary: {
            background: '#059669',
            color: 'white',
            borderColor: '#059669',
        },
        secondary: {
            background: 'white',
            color: '#0f172a',
            borderColor: '#e5e7eb',
        },
        ghost: {
            background: 'transparent',
            color: '#475569',
            borderColor: 'transparent',
        },
        danger: {
            background: '#dc2626',
            color: 'white',
            borderColor: '#dc2626',
        },
    };

    return (
        <button
            style={{
                ...baseStyles,
                ...sizeStyles[size],
                ...variantStyles[variant],
                ...style,
            }}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                        animation: 'spin 1s linear infinite',
                    }}
                >
                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;
