'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: (error: any) => void;
    onExpire?: () => void;
    action?: string;
}

declare global {
    interface Window {
        turnstile: any;
        onTurnstileLoad?: () => void;
    }
}

export default function TurnstileWidget({ siteKey, onVerify, onError, onExpire, action = 'login' }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Function to render the widget
        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                try {
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        callback: onVerify,
                        'error-callback': onError,
                        'expired-callback': onExpire,
                        action: action,
                        theme: 'light',
                    });
                } catch (e) {
                    console.error('Turnstile render error:', e);
                }
            }
        };

        // Check if script is already present
        if (document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
            if (window.turnstile) {
                setIsLoaded(true);
                renderWidget();
            } else {
                // If script exists but turnstile global isn't ready, wait for it
                const checkInterval = setInterval(() => {
                    if (window.turnstile) {
                        clearInterval(checkInterval);
                        setIsLoaded(true);
                        renderWidget();
                    }
                }, 100);
                return () => clearInterval(checkInterval);
            }
        } else {
            // Load script
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                setIsLoaded(true);
                renderWidget();
            };

            document.head.appendChild(script);
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                } catch (e) {
                    // Ignore removal errors
                }
            }
        };
    }, [siteKey, onVerify, onError, onExpire, action]);

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: '65px',
                minWidth: '300px',
                display: 'flex',
                justifyContent: 'center',
                margin: '1.25rem 0'
            }}
        />
    );
}
