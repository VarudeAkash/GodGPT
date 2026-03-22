import DeityIcon from './DeityIcon';

function BuyMoreModal({ isOpen, onClose, deity, onBuyMore }) {
  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <div className="premium-header">
          <h2>Divine Messages Exhausted</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="premium-content">
          <div className="deity-premium-preview">
            <DeityIcon id={deity.id} color={deity.color} size={64} borderRadius={16} />
            <h3>Continue with {deity.name}</h3>
            <p>You've used all your divine messages. Purchase 50 more to continue your spiritual journey.</p>
          </div>

          <div className="pricing-card">
            <div className="price">₹15</div>
            <div className="package-details">
              <h4>50 More Divine Messages</h4>
              <ul>
                <li>✓ Continue deep conversations</li>
                <li>✓ Additional 50 messages</li>
                <li>✓ Unlimited wisdom access</li>
                <li>✓ One-time payment</li>
              </ul>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="purchase-button"
              onClick={onBuyMore}
              style={{ background: deity.color }}
            >
              <span>Buy 50 More Messages - ₹15</span>
              <span className="lock-icon">🔓</span>
            </button>

            <button
              className="secondary-button"
              onClick={onClose}
            >
              Switch to Free Deity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyMoreModal;
