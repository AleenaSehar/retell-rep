import React, { useState, useEffect } from 'react';
import './PhoneNumberManagement.css';

// DEMO MODE FLAG - Set to true for demo without real API calls
const DEMO_MODE = true;

// Mock phone numbers for demo
const MOCK_PHONE_NUMBERS = [
  {
    phone_number_id: 'demo_phone_001',
    phone_number: '+14155551234',
    agent_id: null,
    inbound_webhook_url: null,
  },
  {
    phone_number_id: 'demo_phone_002',
    phone_number: '+12125559876',
    agent_id: 'agent_e0f1f66d174e629f7eda2adb64',
    inbound_webhook_url: null,
  }
];

// Buy Number Modal Component
function BuyNumberModal({ agents, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    areaCode: '',
    agentId: '',
    assignImmediately: false,
  });

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
        <h2>💰 Buy Phone Number {DEMO_MODE && <span className="demo-badge">DEMO MODE</span>}</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      {DEMO_MODE && (
        <div className="demo-warning">
          <p><strong>🎭 Demo Mode Active</strong></p>
          <p>This is a demonstration. No real phone numbers will be purchased. Real functionality requires payment method on Retell account.</p>
        </div>
      )}

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

        {!DEMO_MODE && (
          <div className="cost-warning">
            <p>⚠️ <strong>Cost Notice:</strong> Purchasing phone numbers will incur charges to your Retell account. Check their pricing page for current rates.</p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            💰 {DEMO_MODE ? 'Simulate Purchase' : 'Purchase Number'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Assign Agent Modal Component
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
        <h2>🔗 Assign Agent to Number {DEMO_MODE && <span className="demo-badge">DEMO</span>}</h2>
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

// Main Phone Number Management Component
function PhoneNumberManagement() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [assigningNumber, setAssigningNumber] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPhoneNumbers();
    fetchAgents();
  }, []);

  const fetchPhoneNumbers = async () => {
    setLoading(true);
    
    if (DEMO_MODE) {
      // Demo mode: Use mock data
      setTimeout(() => {
        setPhoneNumbers(MOCK_PHONE_NUMBERS);
        setLoading(false);
      }, 500);
      return;
    }

    // Real mode: Call actual API
    try {
      const response = await fetch('http://localhost:3001/api/phone-numbers/list');
      const data = await response.json();
      
      if (data.success) {
        setPhoneNumbers(data.phoneNumbers);
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      alert('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/list');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleBuyNumber = async (purchaseData) => {
    if (DEMO_MODE) {
      // Demo mode: Simulate purchase
      setTimeout(() => {
        const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
        const newNumber = {
          phone_number_id: `demo_phone_${Date.now()}`,
          phone_number: `+1${purchaseData.areaCode}555${randomNumber.toString().substring(0, 4)}`,
          agent_id: purchaseData.agentId || null,
          inbound_webhook_url: null,
        };
        
        setPhoneNumbers(prev => [...prev, newNumber]);
        alert('✅ Phone number simulated successfully! (Demo Mode)');
        setShowBuyModal(false);
      }, 1000);
      return;
    }

    // Real mode: Call actual API
    try {
      const response = await fetch('http://localhost:3001/api/phone-numbers/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Phone number purchased successfully!');
        setShowBuyModal(false);
        fetchPhoneNumbers();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error buying phone number:', error);
      alert('Failed to purchase phone number');
    }
  };

  const handleAssignAgent = async (phoneNumberId, agentId) => {
    if (DEMO_MODE) {
      // Demo mode: Update locally
      setPhoneNumbers(prev => 
        prev.map(num => 
          num.phone_number_id === phoneNumberId 
            ? { ...num, agent_id: agentId }
            : num
        )
      );
      alert('✅ Agent assigned successfully! (Demo Mode)');
      setAssigningNumber(null);
      return;
    }

    // Real mode: Call actual API
    try {
      const response = await fetch(`http://localhost:3001/api/phone-numbers/${phoneNumberId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Agent assigned successfully!');
        setAssigningNumber(null);
        fetchPhoneNumbers();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
      alert('Failed to assign agent');
    }
  };

  const handleDeleteNumber = async (phoneNumberId) => {
    if (DEMO_MODE) {
      // Demo mode: Remove from list
      setPhoneNumbers(prev => prev.filter(num => num.phone_number_id !== phoneNumberId));
      alert('✅ Phone number released successfully! (Demo Mode)');
      setDeleteConfirm(null);
      return;
    }

    // Real mode: Call actual API
    try {
      const response = await fetch(`http://localhost:3001/api/phone-numbers/${phoneNumberId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Phone number released successfully!');
        setDeleteConfirm(null);
        fetchPhoneNumbers();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting phone number:', error);
      alert('Failed to release phone number');
    }
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

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.agent_id === agentId);
    return agent ? agent.agent_name : 'No Agent Assigned';
  };

  if (loading) {
    return (
      <div className="phone-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading phone numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-management">
      {DEMO_MODE && (
        <div className="demo-mode-banner">
          <p>🎭 <strong>DEMO MODE ACTIVE</strong> - This is a simulation. No real phone numbers are being purchased. Set DEMO_MODE = false in code to enable real functionality.</p>
        </div>
      )}

      <div className="management-header">
        <div>
          <h1>☎️ Phone Number Management</h1>
          <p>Buy and manage phone numbers for your agents</p>
        </div>
        <button 
          className="buy-number-btn"
          onClick={() => setShowBuyModal(true)}
        >
          💰 {DEMO_MODE ? 'Simulate Purchase' : 'Buy Phone Number'}
        </button>
      </div>

      <div className="phone-numbers-grid">
        {phoneNumbers.length === 0 ? (
          <div className="no-numbers">
            <h3>📵 No Phone Numbers Yet</h3>
            <p>{DEMO_MODE ? 'Simulate purchasing your first phone number!' : 'Purchase your first phone number to enable inbound calling!'}</p>
            <button 
              className="buy-number-btn"
              onClick={() => setShowBuyModal(true)}
            >
              💰 {DEMO_MODE ? 'Simulate First Purchase' : 'Buy Your First Number'}
            </button>
          </div>
        ) : (
          phoneNumbers.map((number) => (
            <div key={number.phone_number_id} className="phone-card">
              <div className="phone-card-header">
                <div className="phone-number-display">
                  ☎️ {formatPhoneNumber(number.phone_number)}
                  {DEMO_MODE && <span className="demo-tag">DEMO</span>}
                </div>
                <span className={`status-badge ${number.agent_id ? 'assigned' : 'unassigned'}`}>
                  {number.agent_id ? '✓ Assigned' : '○ Unassigned'}
                </span>
              </div>

              <div className="phone-details">
                <div className="detail-row">
                  <span className="detail-label">Number ID:</span>
                  <span className="detail-value mono">{number.phone_number_id.substring(0, 16)}...</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Assigned Agent:</span>
                  <span className="detail-value">
                    {number.agent_id ? (
                      <span className="agent-name">🤖 {getAgentName(number.agent_id)}</span>
                    ) : (
                      <span className="no-agent">Not assigned</span>
                    )}
                  </span>
                </div>

                {number.inbound_webhook_url && (
                  <div className="detail-row">
                    <span className="detail-label">Webhook:</span>
                    <span className="detail-value mono small">{number.inbound_webhook_url}</span>
                  </div>
                )}
              </div>

              <div className="phone-actions">
                <button 
                  className="assign-btn"
                  onClick={() => setAssigningNumber(number)}
                >
                  🔗 {number.agent_id ? 'Reassign' : 'Assign'} Agent
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => setDeleteConfirm(number)}
                >
                  🗑️ Release
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buy Number Modal */}
      {showBuyModal && (
        <div className="modal-overlay" onClick={() => setShowBuyModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <BuyNumberModal 
              agents={agents}
              onSubmit={handleBuyNumber}
              onCancel={() => setShowBuyModal(false)}
            />
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {assigningNumber && (
        <div className="modal-overlay" onClick={() => setAssigningNumber(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <AssignAgentModal 
              phoneNumber={assigningNumber}
              agents={agents}
              onSubmit={(agentId) => handleAssignAgent(assigningNumber.phone_number_id, agentId)}
              onCancel={() => setAssigningNumber(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Confirm Release</h2>
            <p>Are you sure you want to release <strong>{formatPhoneNumber(deleteConfirm.phone_number)}</strong>?</p>
            {!DEMO_MODE && <p className="warning-text">This will stop all inbound calls to this number!</p>}
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDeleteNumber(deleteConfirm.phone_number_id)}
              >
                Yes, {DEMO_MODE ? 'Remove (Demo)' : 'Release Number'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhoneNumberManagement;