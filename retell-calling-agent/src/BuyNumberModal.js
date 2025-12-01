import React, { useState } from 'react';

function BuyNumberModal({ agents, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    areaCode: '',
    agentId: '',
    assignImmediately: false,
  });

  const [searching, setSearching] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.areaCode) {
      alert('Please enter an area code');
      return;
    }

    if (formData.areaCode.length !== 3) {
      alert('Area code must be exactly 3 digits');
      return;
    }

    if (formData.assignImmediately && !formData.agentId) {
      alert('Please select an agent to assign');
      return;
    }

    const purchaseData = {
      areaCode: formData.areaCode,
    };

    if (formData.assignImmediately && formData.agentId) {
      purchaseData.agentId = formData.agentId;
    }

    onSubmit(purchaseData);
  };

  return (
    <div className="buy-number-form">
      <div className="form-header">
        <h2>💰 Buy Phone Number</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="info-box">
        <p><strong>📍 How it works:</strong></p>
        <ul>
          <li>Enter an area code (e.g., 212 for New York, 415 for San Francisco)</li>
          <li>We'll purchase a random available number in that area code</li>
          <li>Optionally assign it to an agent immediately</li>
          <li>Phone numbers cost money - check Retell pricing</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Number Details</h3>

          <div className="form-group">
            <label>Area Code *</label>
            <input
              type="text"
              name="areaCode"
              value={formData.areaCode}
              onChange={handleChange}
              placeholder="e.g., 415, 212, 310"
              maxLength="3"
              pattern="[0-9]{3}"
              required
            />
            <small>Enter a 3-digit US area code</small>
          </div>

          <div className="form-group">
            <label className="popular-area-codes">Popular Area Codes:</label>
            <div className="area-code-chips">
              <button 
                type="button" 
                className="chip"
                onClick={() => setFormData(prev => ({ ...prev, areaCode: '212' }))}
              >
                212 - New York
              </button>
              <button 
                type="button" 
                className="chip"
                onClick={() => setFormData(prev => ({ ...prev, areaCode: '415' }))}
              >
                415 - San Francisco
              </button>
              <button 
                type="button" 
                className="chip"
                onClick={() => setFormData(prev => ({ ...prev, areaCode: '310' }))}
              >
                310 - Los Angeles
              </button>
              <button 
                type="button" 
                className="chip"
                onClick={() => setFormData(prev => ({ ...prev, areaCode: '312' }))}
              >
                312 - Chicago
              </button>
              <button 
                type="button" 
                className="chip"
                onClick={() => setFormData(prev => ({ ...prev, areaCode: '617' }))}
              >
                617 - Boston
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Agent Assignment (Optional)</h3>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="assignImmediately"
                checked={formData.assignImmediately}
                onChange={handleChange}
              />
              Assign to an agent immediately
            </label>
          </div>

          {formData.assignImmediately && (
            <div className="form-group">
              <label>Select Agent *</label>
              <select 
                name="agentId" 
                value={formData.agentId} 
                onChange={handleChange}
                required={formData.assignImmediately}
              >
                <option value="">-- Select an agent --</option>
                {agents.map(agent => (
                  <option key={agent.agent_id} value={agent.agent_id}>
                    {agent.agent_name}
                  </option>
                ))}
              </select>
              <small>Calls to this number will go to the selected agent</small>
            </div>
          )}
        </div>

        <div className="cost-warning">
          <p>⚠️ <strong>Cost Notice:</strong> Purchasing phone numbers will incur charges to your Retell account. Check their pricing page for current rates.</p>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            💰 Purchase Number
          </button>
        </div>
      </form>
    </div>
  );
}

export default BuyNumberModal;