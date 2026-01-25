'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ImageViewerProps {
    src: string;
    alt?: string;
    onClose?: () => void;
    onDownload?: () => void;
    showDownload?: boolean;
}

// Icon Components
const ZoomInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);

const ZoomOutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);

const RotateIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
    </svg>
);

const FitIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export default function ImageViewer({
    src,
    alt = 'Manuscript image',
    onClose,
    onDownload,
    showDownload = false,
}: ImageViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'none'>('contain');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Zoom limits
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 5;
    const ZOOM_STEP = 0.25;

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
        setFitMode('none');
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
        setFitMode('none');
    }, []);

    const handleRotate = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    const handleFit = useCallback(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setFitMode('contain');
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        setFitMode('contain');
    }, []);

    // Mouse wheel zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
        setFitMode('none');
    }, []);

    // Drag to pan
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoom > 1 || fitMode === 'none') {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    }, [zoom, position, fitMode]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case '+':
                case '=':
                    handleZoomIn();
                    break;
                case '-':
                    handleZoomOut();
                    break;
                case 'r':
                case 'R':
                    handleRotate();
                    break;
                case 'f':
                case 'F':
                    handleFit();
                    break;
                case '0':
                    handleReset();
                    break;
                case 'Escape':
                    onClose?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleZoomIn, handleZoomOut, handleRotate, handleFit, handleReset, onClose]);

    // Attach wheel listener
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    // Image loading
    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    const getTransformStyle = () => {
        const transforms = [];
        if (fitMode === 'none') {
            transforms.push(`translate(${position.x}px, ${position.y}px)`);
        }
        transforms.push(`scale(${zoom})`);
        transforms.push(`rotate(${rotation}deg)`);
        return transforms.join(' ');
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Toolbar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={handleZoomOut}
                        style={toolbarButtonStyle}
                        title="Zoom Out (-)"
                    >
                        <ZoomOutIcon />
                    </button>
                    <span style={{ color: 'white', fontSize: '0.875rem', minWidth: '60px', textAlign: 'center' }}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        style={toolbarButtonStyle}
                        title="Zoom In (+)"
                    >
                        <ZoomInIcon />
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.5rem' }} />
                    <button
                        onClick={handleRotate}
                        style={toolbarButtonStyle}
                        title="Rotate (R)"
                    >
                        <RotateIcon />
                    </button>
                    <button
                        onClick={handleFit}
                        style={toolbarButtonStyle}
                        title="Fit to Screen (F)"
                    >
                        <FitIcon />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {showDownload && onDownload && (
                        <button
                            onClick={onDownload}
                            style={{
                                ...toolbarButtonStyle,
                                background: '#059669',
                            }}
                            title="Download"
                        >
                            <DownloadIcon />
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                ...toolbarButtonStyle,
                                background: 'rgba(255, 255, 255, 0.15)',
                            }}
                            title="Close (Esc)"
                        >
                            <CloseIcon />
                        </button>
                    )}
                </div>
            </div>

            {/* Image Container */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : (zoom > 1 || fitMode === 'none') ? 'grab' : 'default',
                }}
            >
                {loading && (
                    <div style={{ color: 'white', fontSize: '1rem' }}>Loading...</div>
                )}
                {error && (
                    <div style={{ color: '#ef4444', fontSize: '1rem' }}>Failed to load image</div>
                )}
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    draggable={false}
                    style={{
                        maxWidth: fitMode === 'contain' ? '100%' : 'none',
                        maxHeight: fitMode === 'contain' ? '100%' : 'none',
                        objectFit: fitMode === 'contain' ? 'contain' : 'none',
                        transform: getTransformStyle(),
                        transition: isDragging ? 'none' : 'transform 0.2s ease',
                        display: loading || error ? 'none' : 'block',
                        userSelect: 'none',
                    }}
                />
            </div>

            {/* Info bar */}
            <div
                style={{
                    padding: '0.5rem 1.5rem',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                }}
            >
                <span>Scroll to zoom • Drag to pan • Press R to rotate • Press F to fit • Press Esc to close</span>
            </div>
        </div>
    );
}

const toolbarButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    transition: 'background 0.15s',
};
