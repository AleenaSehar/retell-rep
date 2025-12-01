import React, { useState, useEffect } from 'react';
import CreateAgentForm from './CreateAgentForm';
import EditAgentForm from './EditAgentForm';
import './AgentManagement.css';

function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch all agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/agents/list');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      alert('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (agentData) => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Agent created successfully!');
        setShowCreateForm(false);
        fetchAgents(); // Refresh list
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    }
  };

  const handleUpdateAgent = async (agentId, updateData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Agent updated successfully!');
        setEditingAgent(null);
        fetchAgents(); // Refresh list
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Agent deleted successfully!');
        setDeleteConfirm(null);
        fetchAgents(); // Refresh list
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    }
  };

  const confirmDelete = (agent) => {
    setDeleteConfirm(agent);
  };

  if (loading) {
    return (
      <div className="agent-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-management">
      <div className="management-header">
        <div>
          <h1>🤖 Agent Management</h1>
          <p>Create, edit, and manage your AI agents</p>
        </div>
        <button 
          className="create-agent-btn"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Create New Agent
        </button>
      </div>

      <div className="agents-grid">
        {agents.length === 0 ? (
          <div className="no-agents">
            <p>No agents found. Create your first agent to get started!</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.agent_id} className="agent-card-management">
              <div className="agent-card-header">
                <h3>{agent.agent_name}</h3>
                <span className="agent-id">ID: {agent.agent_id.substring(0, 12)}...</span>
              </div>

              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Voice:</span>
                  <span className="detail-value">{agent.voice_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Language:</span>
                  <span className="detail-value">{agent.language}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(agent.last_modification_timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="agent-actions">
                <button 
                  className="edit-btn"
                  onClick={() => setEditingAgent(agent)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => confirmDelete(agent)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <CreateAgentForm 
              onSubmit={handleCreateAgent}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="modal-overlay" onClick={() => setEditingAgent(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <EditAgentForm 
              agent={editingAgent}
              onSubmit={(updateData) => handleUpdateAgent(editingAgent.agent_id, updateData)}
              onCancel={() => setEditingAgent(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Confirm Deletion</h2>
            <p>Are you sure you want to delete <strong>{deleteConfirm.agent_name}</strong>?</p>
            <p className="warning-text">This action cannot be undone!</p>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDeleteAgent(deleteConfirm.agent_id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentManagement;