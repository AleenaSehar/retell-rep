import React, { useState } from 'react';

function AssignAgentModal({ phoneNumber, agents, onSubmit, onCancel }) {
  const [selectedAgent, setSelectedAgent] = useState(phoneNumber.agent_id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedAgent) {
      alert('Please select an agent');
      return;
    }

    onSubmit(selectedAgent);
  };

  const formatPhoneNumber = (number) => {
    if (!number) return 'N/A';
    const cleaned = number.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return number;
  };

  return (
    <div className="assign-agent-form">
      <div className="form-header">
        <h2>🔗 Assign Agent to Number</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="phone-info-box">
        <p><strong>Phone Number:</strong></p>
        <p className="phone-display">☎️ {formatPhoneNumber(phoneNumber.phone_number)}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label>Select Agent *</label>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              required
            >
              <option value="">-- Choose an agent --</option>
              {agents.map(agent => (
                <option key={agent.agent_id} value={agent.agent_id}>
                  {agent.agent_name} ({agent.voice_id})
                </option>
              ))}
            </select>
            <small>
              {phoneNumber.agent_id 
                ? 'This will replace the current agent assignment' 
                : 'Inbound calls to this number will be handled by the selected agent'}
            </small>
          </div>

          {agents.length === 0 && (
            <div className="warning-box">
              <p>⚠️ No agents available. Please create an agent first.</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={agents.length === 0}
          >
            {phoneNumber.agent_id ? 'Reassign Agent' : 'Assign Agent'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignAgentModal;