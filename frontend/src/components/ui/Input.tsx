import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    style,
    ...props
}) => {
    return (
        <div style={{ width: '100%' }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                    }}
                >
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {leftIcon && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {leftIcon}
                    </div>
                )}
                <input
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: `0.5rem ${rightIcon ? '2.5rem' : '0.75rem'} 0.5rem ${leftIcon ? '2.5rem' : '0.75rem'}`,
                        fontSize: '0.875rem',
                        border: `1px solid ${error ? '#dc2626' : '#e5e7eb'}`,
                        borderRadius: '0.5rem',
                        background: 'white',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        ...style,
                    }}
                    {...props}
                />
                {rightIcon && (
                    <div
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {rightIcon}
                    </div>
                )}
            </div>
            {(error || helperText) && (
                <p
                    style={{
                        fontSize: '0.8125rem',
                        color: error ? '#dc2626' : '#64748b',
                        marginTop: '0.375rem',
                    }}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
