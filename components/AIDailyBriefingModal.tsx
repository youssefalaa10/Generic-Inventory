import React from 'react';
import { SparklesIcon } from './Icon';

interface AIDailyBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    briefingContent: string | null;
    isLoading: boolean;
}

// Simple Markdown to HTML renderer
const renderMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--text-primary);">$1</h3>')
        .replace(/^\*\* (.*$)/gim, '<p><strong>$1</strong></p>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>');

    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>').replace(/<\/ul>\s*<ul>/g, '');
    
    return { __html: html };
};


const AIDailyBriefingModal: React.FC<AIDailyBriefingModalProps> = ({ isOpen, onClose, briefingContent, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '42rem' }}>
                <div className="modal-header">
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <SparklesIcon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>الموجز اليومي الذكي</h2>
                    </div>
                </div>
                <div className="modal-body" style={{ minHeight: '300px' }}>
                    {isLoading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            <div className="thinking-indicator">
                                <span></span><span></span><span></span>
                            </div>
                            <p style={{marginTop: '1rem'}}>يقوم "فهيم" بإعداد موجزك اليومي...</p>
                        </div>
                    )}
                    {!isLoading && briefingContent && (
                        <div 
                            className="ai-briefing-content"
                            style={{ lineHeight: 1.7, fontSize: '1.05rem', color: 'var(--text-secondary)' }}
                            dangerouslySetInnerHTML={renderMarkdown(briefingContent)}
                        />
                    )}
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button onClick={onClose} className="btn btn-secondary" style={{ minWidth: '150px' }}>
                        حسنًا، فهمت!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIDailyBriefingModal;
