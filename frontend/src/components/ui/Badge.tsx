import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    style,
}) => {
    const variantStyles = {
        default: {
            background: '#ecfdf5',
            color: '#047857',
        },
        success: {
            background: '#dcfce7',
            color: '#166534',
        },
        warning: {
            background: '#fef3c7',
            color: '#92400e',
        },
        error: {
            background: '#fee2e2',
            color: '#991b1b',
        },
        neutral: {
            background: '#f1f5f9',
            color: '#475569',
        },
    };

    const sizeStyles = {
        sm: {
            padding: '0.125rem 0.5rem',
            fontSize: '0.6875rem',
        },
        md: {
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
        },
    };

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontWeight: 500,
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                ...variantStyles[variant],
                ...sizeStyles[size],
                ...style,
            }}
        >
            {dot && (
                <span
                    style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'currentColor',
                    }}
                />
            )}
            {children}
        </span>
    );
};

export default Badge;
