import React from 'react';

interface CardProps {
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    interactive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    interactive = false,
    style,
    className,
}) => {
    const paddingValues = {
        none: '0',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
    };

    return (
        <div
            className={className}
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: paddingValues[padding],
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                transition: 'all 0.2s ease',
                cursor: interactive ? 'pointer' : 'default',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => (
    <div
        style={{
            marginBottom: '1rem',
            ...style,
        }}
    >
        {children}
    </div>
);

interface CardTitleProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    style?: React.CSSProperties;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, size = 'md', style }) => {
    const sizeStyles = {
        sm: { fontSize: '0.9375rem' },
        md: { fontSize: '1.125rem' },
        lg: { fontSize: '1.25rem' },
    };

    return (
        <h3
            style={{
                fontWeight: 600,
                color: '#0f172a',
                margin: 0,
                ...sizeStyles[size],
                ...style,
            }}
        >
            {children}
        </h3>
    );
};

interface CardDescriptionProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style }) => (
    <p
        style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '0.25rem 0 0',
            lineHeight: 1.5,
            ...style,
        }}
    >
        {children}
    </p>
);

interface CardContentProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => (
    <div style={style}>{children}</div>
);

interface CardFooterProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => (
    <div
        style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            ...style,
        }}
    >
        {children}
    </div>
);

export default Card;
