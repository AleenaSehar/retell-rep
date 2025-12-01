import React, { useState } from 'react';

function EditAgentForm({ agent, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    agent_name: agent.agent_name || '',
    voice_id: agent.voice_id || '11labs-Adrian',
    language: agent.language || 'en-US',
    interruption_sensitivity: agent.interruption_sensitivity ?? 1,
    responsiveness: agent.responsiveness ?? 1,
    enable_backchannel: agent.enable_backchannel ?? true,
    ambient_sound: agent.ambient_sound || 'off',
    ambient_sound_volume: agent.ambient_sound_volume ?? 0.5,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'range' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agent_name.trim()) {
      alert('Please enter an agent name');
      return;
    }

    // Build update payload with only editable fields
    const updateData = {
      agent_name: formData.agent_name,
      voice_id: formData.voice_id,
      language: formData.language,
      interruption_sensitivity: formData.interruption_sensitivity,
      responsiveness: formData.responsiveness,
      enable_backchannel: formData.enable_backchannel,
    };

    // Only add ambient sound if not 'off'
    if (formData.ambient_sound && formData.ambient_sound !== 'off') {
      updateData.ambient_sound = formData.ambient_sound;
      updateData.ambient_sound_volume = formData.ambient_sound_volume;
    }

    console.log('Submitting update:', updateData);
    onSubmit(updateData);
  };

  return (
    <div className="agent-form">
      <div className="form-header">
        <h2>✏️ Edit Agent</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="agent-id-display">
        <small>Agent ID: {agent.agent_id}</small>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label>Agent Name *</label>
            <input
              type="text"
              name="agent_name"
              value={formData.agent_name}
              onChange={handleChange}
              placeholder="e.g., Customer Support Agent"
              required
            />
          </div>

          <div className="form-group">
            <label>Voice</label>
            <select name="voice_id" value={formData.voice_id} onChange={handleChange}>
              <option value="11labs-Adrian">Adrian (Male, Deep)</option>
              <option value="11labs-Domi">Domi (Female, Friendly)</option>
              <option value="11labs-Dave">Dave (Male, Professional)</option>
              <option value="11labs-Bella">Bella (Female, Warm)</option>
              <option value="11labs-Antoni">Antoni (Male, Clear)</option>
              <option value="11labs-Elli">Elli (Female, Young)</option>
              <option value="11labs-Josh">Josh (Male, Energetic)</option>
              <option value="11labs-Arnold">Arnold (Male, Authoritative)</option>
              <option value="11labs-Adam">Adam (Male, Conversational)</option>
              <option value="11labs-Sam">Sam (Male/Female, Neutral)</option>
            </select>
            <small>Choose the voice personality for your agent</small>
          </div>

          <div className="form-group">
            <label>Language</label>
            <select name="language" value={formData.language} onChange={handleChange}>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-AU">English (Australia)</option>
              <option value="en-IN">English (India)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="es-MX">Spanish (Mexico)</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="ja-JP">Japanese</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="ko-KR">Korean</option>
            </select>
          </div>

          <div className="info-box">
            <p>ℹ️ To update the agent's prompt or LLM settings, you need to update the LLM directly in the Retell dashboard.</p>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          type="button"
          className="toggle-advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="form-section">
            <h3>Advanced Settings</h3>

            <div className="form-group">
              <label>Interruption Sensitivity</label>
              <input
                type="range"
                name="interruption_sensitivity"
                min="0"
                max="1"
                step="0.1"
                value={formData.interruption_sensitivity}
                onChange={handleChange}
              />
              <small>Current: {formData.interruption_sensitivity} (0 = Less sensitive, 1 = More sensitive)</small>
            </div>

            <div className="form-group">
              <label>Responsiveness</label>
              <input
                type="range"
                name="responsiveness"
                min="0"
                max="1"
                step="0.1"
                value={formData.responsiveness}
                onChange={handleChange}
              />
              <small>Current: {formData.responsiveness} (0 = Slower, 1 = Faster)</small>
            </div>

            <div className="form-group">
              <label>Ambient Sound</label>
              <select name="ambient_sound" value={formData.ambient_sound} onChange={handleChange}>
                <option value="off">Off</option>
                <option value="coffee-shop">Coffee Shop</option>
                <option value="convention-hall">Convention Hall</option>
                <option value="summer-outdoor">Summer Outdoor</option>
                <option value="mountain-outdoor">Mountain Outdoor</option>
                <option value="static-noise">Static Noise</option>
                <option value="call-center">Call Center</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ambient Sound Volume</label>
              <input
                type="range"
                name="ambient_sound_volume"
                min="0"
                max="1"
                step="0.1"
                value={formData.ambient_sound_volume}
                onChange={handleChange}
              />
              <small>Current: {formData.ambient_sound_volume}</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="enable_backchannel"
                  checked={formData.enable_backchannel}
                  onChange={handleChange}
                />
                Enable Backchannel (Agent says "mm-hmm", "yeah", etc.)
              </label>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Update Agent
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAgentForm;