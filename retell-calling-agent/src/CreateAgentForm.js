import React, { useState } from 'react';

function CreateAgentForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    agent_name: '',
    voice_id: '11labs-Adrian',
    general_prompt: 'You are a helpful and friendly AI assistant. Be concise, professional, and helpful in your responses.',
    language: 'en-US',
    llm_websocket_url: '',
    interruption_sensitivity: 1,
    responsiveness: 1,
    enable_backchannel: true,
    ambient_sound: 'coffee-shop',
    ambient_sound_volume: 0.5,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.agent_name.trim()) {
      alert('Please enter an agent name');
      return;
    }

    if (!formData.general_prompt.trim()) {
      alert('Please enter a system prompt');
      return;
    }

    console.log('Submitting agent data:', formData);
    onSubmit(formData);
  };

  return (
    <div className="agent-form">
      <div className="form-header">
        <h2>➕ Create New Agent</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
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
            <label>System Prompt *</label>
            <textarea
              name="general_prompt"
              value={formData.general_prompt}
              onChange={handleChange}
              placeholder="You are a helpful assistant..."
              rows={4}
              required
            />
            <small>Define how your agent should behave and respond</small>
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
              <label>Custom LLM WebSocket URL (Optional)</label>
              <input
                type="url"
                name="llm_websocket_url"
                value={formData.llm_websocket_url}
                onChange={handleChange}
                placeholder="wss://your-llm-endpoint.com"
              />
              <small>Leave empty to use Retell's default GPT-4o model</small>
            </div>

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
            Create Agent
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAgentForm;