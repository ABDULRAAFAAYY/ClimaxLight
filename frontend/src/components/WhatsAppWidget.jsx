import React from 'react';

const WhatsAppWidget = () => {
    const phoneNumber = '923360994280'; // 03360994280 in international format
    const message = encodeURIComponent('Hello Climax Lights! I would like to inquire about your products.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="whatsapp-widget"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                backgroundColor: '#25D366',
                color: 'white',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                zIndex: 9999,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
            }}
        >
            <svg 
                viewBox="0 0 24 24" 
                width="32" 
                height="32" 
                fill="currentColor"
            >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.417 9.864-9.848.002-2.63-1.023-5.101-2.884-6.964C16.593 1.98 14.128.956 11.5.956 6.061.956 1.638 5.373 1.635 10.801c-.001 1.7.443 3.353 1.29 4.822L1.874 20.15l4.773-1.252zm11.332-6.52c-.312-.156-1.85-.913-2.137-1.018-.288-.105-.497-.156-.706.156-.208.312-.806 1.018-.988 1.228-.182.21-.364.237-.676.08-1.344-.672-2.228-1.182-3.11-2.695-.23-.396.23-.367.658-1.222.07-.156.035-.288-.018-.396-.052-.105-.497-1.196-.681-1.639-.18-.432-.377-.373-.518-.38-.133-.006-.288-.007-.442-.007-.154 0-.406.058-.618.288-.212.23-.808.788-.808 1.922 0 1.134.824 2.228.938 2.384.115.156 1.62 2.474 3.925 3.469.55.236 1.01.378 1.348.486.55.174 1.05.15 1.444.09.44-.067 1.85-.757 2.112-1.45.263-.692.263-1.288.185-1.414-.078-.126-.288-.203-.6-.36z"/>
            </svg>
        </a>
    );
};

export default WhatsAppWidget;
