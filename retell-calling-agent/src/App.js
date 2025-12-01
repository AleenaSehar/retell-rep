import React, { useState, useEffect } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import AgentManagement from './AgentManagement';
import PhoneNumberManagement from './PhoneNumberManagement';
import './App.css';

function App() {
  // Navigation state
  const [currentTab, setCurrentTab] = useState('call'); // 'call', 'manage', or 'numbers'
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('Ready to call');
  const [callHistory, setCallHistory] = useState([]);
  const [retellClient, setRetellClient] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Fetch available agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/list');
      const data = await response.json();
      
      if (data.success) {
        setAvailableAgents(data.agents);
        setSelectedAgent(data.agents[0]);
      }
      setLoadingAgents(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoadingAgents(false);
    }
  };

  // Initialize Retell client
  useEffect(() => {
    const client = new RetellWebClient();
    setRetellClient(client);

    client.on('call_started', () => {
      console.log('Call started');
      setCallStatus('Call connected!');
    });

    client.on('call_ended', () => {
      console.log('Call ended');
      setCallStatus('Call ended');
      setIsCallActive(false);
    });

    client.on('agent_start_talking', () => {
      setCallStatus('Agent speaking...');
    });

    client.on('agent_stop_talking', () => {
      setCallStatus('Listening...');
    });

    client.on('error', (error) => {
      console.error('Call error:', error);
      setCallStatus('Error: ' + error.message);
      setIsCallActive(false);
    });

    return () => {
      client.stopCall();
    };
  }, []);

  const startCall = async () => {
    if (!selectedAgent) {
      alert('Please select an agent first!');
      return;
    }

    try {
      setCallStatus('Connecting...');
      setIsCallActive(true);

      const response = await fetch('http://localhost:3001/create-web-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent.agent_id,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        await retellClient.startCall({
          accessToken: data.access_token,
        });

        const newCall = {
          id: data.call_id,
          timestamp: new Date().toLocaleString(),
          status: 'Active',
          agentName: selectedAgent.agent_name,
          agentIcon: '🤖',
        };
        setCallHistory(prev => [newCall, ...prev]);
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('Failed to start call');
      setIsCallActive(false);
    }
  };

  const endCall = () => {
    retellClient.stopCall();
    setIsCallActive(false);
    setCallStatus('Call ended');

    if (callHistory.length > 0) {
      const updatedHistory = [...callHistory];
      updatedHistory[0].status = 'Completed';
      setCallHistory(updatedHistory);
    }
  };

  const fetchCallDetails = async (callId) => {
    setLoadingDetails(true);
    setSelectedCall(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`http://localhost:3001/get-call/${callId}`);
      const data = await response.json();
      
      setSelectedCall(data);
    } catch (error) {
      console.error('Error fetching call details:', error);
      alert('Failed to load call details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const exportToCSV = () => {
    if (callHistory.length === 0) {
      alert('No calls to export!');
      return;
    }

    const headers = 'Call ID,Timestamp,Agent,Status\n';
    const rows = callHistory.map(call => 
      `${call.id},${call.timestamp},${call.agentName},${call.status}`
    ).join('\n');
    
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loadingAgents) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>AI Voice Agent Platform</h1>
            <p>Powered by Retell AI Technology</p>
          </div>
        </div>
      </header>

      {/* Professional Navigation Tabs */}
      <div className="navigation-tabs">
        <div className="nav-container">
          <button 
            className={`tab-btn ${currentTab === 'call' ? 'active' : ''}`}
            onClick={() => setCurrentTab('call')}
          >
            📞 Make Calls
          </button>
          <button 
            className={`tab-btn ${currentTab === 'manage' ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab('manage');
              fetchAgents();
            }}
          >
            🤖 Manage Agents
          </button>
          <button 
            className={`tab-btn ${currentTab === 'numbers' ? 'active' : ''}`}
            onClick={() => setCurrentTab('numbers')}
          >
            ☎️ Phone Numbers
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      {currentTab === 'call' ? (
        <main className="main-content">
          {/* Agent Selection Section */}
          <div className="agent-section">
            <h2>Select Your Agent</h2>
            <div className="agent-selector">
              {availableAgents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className={`agent-card ${selectedAgent?.agent_id === agent.agent_id ? 'selected' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="agent-icon">🤖</div>
                  <h3>{agent.agent_name}</h3>
                  <p>Voice: {agent.voice_id}</p>
                  {selectedAgent?.agent_id === agent.agent_id && (
                    <div className="selected-badge">✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Call Button */}
          <div className="call-section">
            <button 
              className={`call-button ${isCallActive ? 'active' : ''}`}
              onClick={isCallActive ? endCall : startCall}
              disabled={!selectedAgent}
            >
              {isCallActive ? '📞 End Call' : `🎤 Start Call with ${selectedAgent?.agent_name || 'Agent'}`}
            </button>
            <p className="status">{callStatus}</p>
          </div>

          {/* Call History Section */}
          <div className="history-section">
            <h2>Call History ({callHistory.length})</h2>
            <div className="history-list">
              {callHistory.length === 0 ? (
                <p>No calls yet</p>
              ) : (
                callHistory.map((call, index) => (
                  <div key={index} className="call-item">
                    <div className="call-item-left">
                      <span className="agent-badge">{call.agentIcon} {call.agentName}</span>
                      <span className="call-time">{call.timestamp}</span>
                      <span className="call-id">ID: {call.id.substring(0, 12)}...</span>
                    </div>
                    <div className="call-item-right">
                      <span className={`call-status ${call.status.toLowerCase()}`}>
                        {call.status}
                      </span>
                      {call.status === 'Completed' && (
                        <button 
                          className="view-details-btn"
                          onClick={() => fetchCallDetails(call.id)}
                        >
                          📄 View Details
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              className="export-button"
              onClick={exportToCSV}
              disabled={callHistory.length === 0}
            >
              📥 Export to CSV
            </button>
          </div>

          {/* Call Details Modal */}
          {(selectedCall || loadingDetails) && (
            <div className="modal-overlay" onClick={() => setSelectedCall(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>📊 Call Details</h2>
                  <button className="close-btn" onClick={() => setSelectedCall(null)}>✕</button>
                </div>
                
                {loadingDetails ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading call details...</p>
                  </div>
                ) : (
                  <>
                    <div className="call-meta">
                      <div className="meta-item">
                        <span className="meta-label">AGENT</span>
                        <span className="meta-value">{selectedAgent?.agent_name}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">CALL ID</span>
                        <span className="meta-value">{selectedCall.call_id}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">DURATION</span>
                        <span className="meta-value">{formatDuration(selectedCall.duration)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">STATUS</span>
                        <span className="meta-value status-badge">{selectedCall.call_status}</span>
                      </div>
                    </div>

                    <div className="transcript-section">
                      <h3>💬 Conversation Transcript</h3>
                      <div className="transcript-content">
                        {selectedCall.transcript === 'Transcript not available yet' ? (
                          <p className="no-transcript">
                            Transcript is being processed. Please wait a moment and try again.
                          </p>
                        ) : (
                          <div className="transcript-messages">
                            {typeof selectedCall.transcript === 'string' ? (
                              selectedCall.transcript.split(/(?=Agent:|User:)/i).filter(line => line.trim()).map((line, idx) => {
                                const isAgent = line.trim().toLowerCase().startsWith('agent:');
                                const isUser = line.trim().toLowerCase().startsWith('user:');
                                
                                if (!isAgent && !isUser) return null;
                                
                                const content = line.replace(/^(Agent:|User:)/i, '').trim();
                                
                                return (
                                  <div key={idx} className={`message ${isAgent ? 'agent' : 'user'}`}>
                                    <span className="message-role">
                                      {isAgent ? '🤖 Agent:' : '👤 You:'}
                                    </span>
                                    <span className="message-text">{content}</span>
                                  </div>
                                );
                              })
                            ) : Array.isArray(selectedCall.transcript) ? (
                              selectedCall.transcript.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.role}`}>
                                  <span className="message-role">
                                    {msg.role === 'agent' ? '🤖 Agent:' : '👤 You:'}
                                  </span>
                                  <span className="message-text">{msg.content}</span>
                                </div>
                              ))
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedCall.recording_url && (
                      <div className="recording-section">
                        <h3>🎵 Call Recording</h3>
                        <audio controls src={selectedCall.recording_url} className="audio-player">
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      ) : currentTab === 'manage' ? (
        <AgentManagement />
      ) : (
        <PhoneNumberManagement />
      )}
    </div>
  );
}

export default App;