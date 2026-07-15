import { useState, useEffect } from 'react';
import { t } from '../lib/i18n';
import './RateUsModal.css';

interface RateUsModalProps {
  open: boolean;
  onClose: () => void;
  onRated: () => void;
}

export function RateUsModal({ open, onClose, onRated }: RateUsModalProps) {
  const [phase, setPhase] = useState<'ask' | 'action-love' | 'action-dislike'>('ask');

  useEffect(() => {
    if (open) {
      setPhase('ask');
    }
  }, [open]);

  if (!open) return null;

  function handleSentiment(sentiment: 'love' | 'okay' | 'dislike') {
    if (sentiment === 'okay') {
      onClose(); // Just dismiss
    } else if (sentiment === 'love') {
      setPhase('action-love');
    } else {
      setPhase('action-dislike');
    }
  }

  function handleRate() {
    onRated();
    onClose();
    const isEdge = navigator.userAgent.includes('Edg');
    const storeUrl = isEdge
      ? `https://microsoftedge.microsoft.com/addons/detail/${chrome.runtime.id}`
      : `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`;
    browser.tabs.create({ url: storeUrl });
  }

  function handleFeedback() {
    onRated(); // We consider feedback as "rated" so we don't ask again
    onClose();
    
    // 获取当前语言环境，判断是否是中文
    const isZh = chrome.i18n.getUILanguage().startsWith('zh');
    
    // 中英文分别跳转不同的腾讯问卷
    const feedbackUrl = isZh 
      ? 'https://wj.qq.com/s2/27317702/dcf5/' 
      : 'https://wj.qq.com/s2/27318236/f710/';
      
    browser.tabs.create({ url: feedbackUrl });
  }

  return (
    <div className="editor-modal-overlay">
      <div className="editor-modal">
        {phase === 'ask' && (
          <>
            <h3 className="editor-modal-title">{t('rateUsAskTitle', '你喜欢用截图王吗？')}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '24px 0' }}>
              <button 
                onClick={() => handleSentiment('dislike')}
                style={{ background: 'transparent', border: '1px solid var(--sc-border)', borderRadius: '8px', padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontSize: '28px' }}>😞</span>
                <span style={{ fontSize: '12px', color: 'var(--sc-text-secondary)' }}>{t('rateUsDislike', '不好用')}</span>
              </button>
              <button 
                onClick={() => handleSentiment('okay')}
                style={{ background: 'transparent', border: '1px solid var(--sc-border)', borderRadius: '8px', padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontSize: '28px' }}>😐</span>
                <span style={{ fontSize: '12px', color: 'var(--sc-text-secondary)' }}>{t('rateUsOkay', '还行')}</span>
              </button>
              <button 
                onClick={() => handleSentiment('love')}
                style={{ background: 'transparent', border: '1px solid var(--sc-border)', borderRadius: '8px', padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontSize: '28px' }}>😊</span>
                <span style={{ fontSize: '12px', color: 'var(--sc-text-secondary)' }}>{t('rateUsLove', '很好用')}</span>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { onRated(); onClose(); }} style={{ background: 'transparent', border: 'none', color: 'var(--sc-text-tertiary)', fontSize: '12px', cursor: 'pointer', padding: '4px' }}>
                {t('rateUsNoThanks', '不再询问')}
              </button>
            </div>
          </>
        )}

        {phase === 'action-love' && (
          <>
            <h3 className="editor-modal-title">{t('rateUsAwesome', '太棒了！🎉')}</h3>
            <p className="editor-modal-desc">{t('rateUsAwesomeDesc', '能去应用商店给我们留个评价吗？这对我们有极大的鼓励！')}</p>
            <div className="editor-modal-actions">
              <button className="editor-action-btn" onClick={onClose}>
                {t('rateUsLater', '下次一定')}
              </button>
              <button className="editor-action-btn confirm" onClick={handleRate}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {t('rateUsConfirm', '去给个五星 ⭐')}
              </button>
            </div>
          </>
        )}

        {phase === 'action-dislike' && (
          <>
            <h3 className="editor-modal-title">{t('rateUsSorry', '很抱歉 😔')}</h3>
            <p className="editor-modal-desc">{t('rateUsSorryDesc', '请告诉我们需要改进的地方，帮助我们将截图王做得更好。')}</p>
            <div className="editor-modal-actions">
              <button className="editor-action-btn" onClick={onClose}>
                {t('rateUsLater', '下次一定')}
              </button>
              <button className="editor-action-btn confirm" onClick={handleFeedback}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {t('rateUsFeedback', '提供建议')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
