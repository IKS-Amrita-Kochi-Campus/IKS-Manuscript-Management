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
        let mounted = true;

        // Function to render the widget
        const renderWidget = () => {
            if (!mounted) return;

            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                try {
                    // clear container just in case
                    if (containerRef.current.innerHTML !== '') {
                        containerRef.current.innerHTML = '';
                    }

                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        callback: (token: string) => {
                            if (mounted) onVerify(token);
                        },
                        'error-callback': (err: any) => {
                            if (mounted && onError) onError(err);
                        },
                        'expired-callback': () => {
                            if (mounted && onExpire) onExpire();
                        },
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
                        if (mounted) {
                            setIsLoaded(true);
                            renderWidget();
                        }
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
                if (mounted) {
                    setIsLoaded(true);
                    renderWidget();
                }
            };

            document.head.appendChild(script);
        }

        return () => {
            mounted = false;
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                } catch (e) {
                    // Ignore removal errors
                }
            }
        };
    }, [siteKey, action]); // Removed callbacks from dependencies to prevent re-renders

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
