import DeityIcon from './DeityIcon';

function PremiumModal({ isOpen, onClose, deity, onPurchase, isProcessingPayment }) {
  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <div className="premium-header">
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="premium-content">
          <div className="deity-premium-preview">
            <DeityIcon id={deity.id} color={deity.color} imageUrl={deity.avatarUrl} size={64} borderRadius={16} />
            <h3>Chat with {deity.name}</h3>
            <p>{deity.description}</p>
          </div>

          <div className="pricing-card">
            <div className="price">₹15</div>
            <div className="package-details">
              <h4>50 Divine Messages</h4>
              <ul>
                <li>✓ Deep conversations with {deity.name}</li>
                <li>✓ Personalized spiritual guidance</li>
                <li>✓ Unlimited wisdom for 50 messages</li>
                <li>✓ One-time payment</li>
              </ul>
            </div>
          </div>

          <button
            className={`purchase-button ${isProcessingPayment ? 'processing' : ''}`}
            onClick={onPurchase}
            disabled={isProcessingPayment}
            style={{ background: deity.color }}
          >
            {isProcessingPayment ? (
              <>
                <div className="spinner-small"></div>
                Processing UPI Payment...
              </>
            ) : (
              <>
                <span>Unlock with UPI - ₹15</span>
                <span className="lock-icon">🔓</span>
              </>
            )}
          </button>

          <div className="free-option">
            <p>Not ready? <button onClick={onClose}>Use remaining free messages</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumModal;
