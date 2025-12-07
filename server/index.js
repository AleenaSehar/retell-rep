const express = require('express');
const cors = require('cors');
const { Retell } = require('retell-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Retell client with your API key
const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

// ============================================
// AGENT MANAGEMENT ENDPOINTS
// ============================================

// Get all agents - ENHANCED VERSION
app.get('/api/agents/list', async (req, res) => {
  try {
    const response = await retellClient.agent.list();
    
    // Fetch LLM details for each agent to get general_prompt
    const agentsWithPrompts = await Promise.all(
      response.map(async (agent) => {
        if (agent.response_engine?.llm_id) {
          try {
            const llm = await retellClient.llm.retrieve(agent.response_engine.llm_id);
            agent.general_prompt = llm.general_prompt;
            agent.llm_id = llm.llm_id;
          } catch (error) {
            console.log(`Could not fetch LLM for agent ${agent.agent_id}`);
          }
        }
        return agent;
      })
    );
    
    res.json({
      success: true,
      agents: agentsWithPrompts,
      count: agentsWithPrompts.length
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get single agent details - ENHANCED VERSION
app.get('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await retellClient.agent.retrieve(id);
    
    // If agent has an LLM, fetch its details to get the general_prompt
    if (agent.response_engine?.llm_id) {
      try {
        const llm = await retellClient.llm.retrieve(agent.response_engine.llm_id);
        agent.general_prompt = llm.general_prompt;
        agent.llm_id = llm.llm_id;
      } catch (llmError) {
        console.log('Could not fetch LLM details:', llmError.message);
      }
    }
    
    res.json({
      success: true,
      agent: agent
    });
  } catch (error) {
    console.error('Error retrieving agent:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Create new agent
app.post('/api/agents/create', async (req, res) => {
  try {
    const {
      agent_name,
      voice_id,
      general_prompt,
      language,
      ambient_sound,
      ambient_sound_volume,
      interruption_sensitivity,
      responsiveness,
      enable_backchannel,
      llm_websocket_url,
      llm_id,
    } = req.body;

    console.log('📥 Received request body:', JSON.stringify(req.body, null, 2));

    // Build agent config
    const agentConfig = {
      agent_name: agent_name,
      voice_id: voice_id || '11labs-Adrian',
      language: language || 'en-US',
    };

    // Add response_engine based on what user provided
    if (llm_websocket_url) {
      // Custom LLM via WebSocket
      agentConfig.response_engine = {
        type: 'custom-llm',
        llm_websocket_url: llm_websocket_url,
      };
    } else if (llm_id) {
      // Use existing LLM ID
      agentConfig.response_engine = {
        type: 'retell-llm',
        llm_id: llm_id,
      };
    } else {
      // Auto-create LLM with general_prompt
      console.log('📝 Creating LLM first...');
      const llmConfig = {
        general_prompt: general_prompt || 'You are a helpful assistant.',
        model: 'gpt-4o',
        begin_message: 'Hello! How can I help you today?',
      };
      
      const newLLM = await retellClient.llm.create(llmConfig);
      console.log('✅ LLM created:', newLLM.llm_id);
      
      agentConfig.response_engine = {
        type: 'retell-llm',
        llm_id: newLLM.llm_id,
      };
    }

    // Add optional parameters
    if (ambient_sound && ambient_sound !== 'off') {
      agentConfig.ambient_sound = ambient_sound;
    }
    if (ambient_sound_volume !== undefined) {
      agentConfig.ambient_sound_volume = ambient_sound_volume;
    }
    if (interruption_sensitivity !== undefined) {
      agentConfig.interruption_sensitivity = interruption_sensitivity;
    }
    if (responsiveness !== undefined) {
      agentConfig.responsiveness = responsiveness;
    }
    if (enable_backchannel !== undefined) {
      agentConfig.enable_backchannel = enable_backchannel;
    }

    console.log('📤 Sending to Retell API:', JSON.stringify(agentConfig, null, 2));

    const newAgent = await retellClient.agent.create(agentConfig);
    
    console.log('✅ Agent created successfully:', newAgent.agent_id);
    
    res.json({
      success: true,
      agent: newAgent,
      message: 'Agent created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating agent:', error);
    console.error('❌ Error details:', error.error);
    
    res.status(500).json({ 
      success: false,
      error: error.error?.error_message || error.message
    });
  }
});

// Update existing agent - FIXED VERSION
// Update existing agent - IMPROVED ERROR HANDLING
app.patch('/api/agents/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('📥 Update request for agent:', id);
    console.log('📥 Update data received:', JSON.stringify(updateData, null, 2));

    // Remove fields that might cause issues
    const cleanUpdateData = { ...updateData };
    delete cleanUpdateData.general_prompt; // Can't update this directly
    delete cleanUpdateData.llm_id; // Can't update this
    delete cleanUpdateData.agent_id; // Can't update this

    console.log('📤 Clean update data:', JSON.stringify(cleanUpdateData, null, 2));

    // Only proceed if there are fields to update
    if (Object.keys(cleanUpdateData).length > 0) {
      const updatedAgent = await retellClient.agent.update(id, cleanUpdateData);
      console.log('✅ Agent updated:', id);
      
      res.json({
        success: true,
        agent: updatedAgent,
        message: 'Agent updated successfully'
      });
    } else {
      // If no valid fields to update
      const agent = await retellClient.agent.retrieve(id);
      res.json({
        success: true,
        agent: agent,
        message: 'No changes to update'
      });
    }
  } catch (error) {
    console.error('❌ Error updating agent:', error);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    res.status(500).json({ 
      success: false,
      error: error.error?.error_message || error.message || 'Unknown error'
    });
  }
});

// Delete agent
app.delete('/api/agents/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    
    await retellClient.agent.delete(id);
    
    console.log('✅ Agent deleted:', id);
    
    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ============================================
// EXISTING CALL ENDPOINTS
// ============================================

// Endpoint to create web call
app.post('/create-web-call', async (req, res) => {
  try {
    const { agentId } = req.body;
    
    const callResponse = await retellClient.call.createWebCall({
      agent_id: agentId,
    });
    
    console.log('Web call created:', callResponse.call_id);
    
    res.json({
      access_token: callResponse.access_token,
      call_id: callResponse.call_id,
      agent_id: agentId,
    });
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get call details with transcript
app.get('/get-call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    
    const callDetails = await retellClient.call.retrieve(callId);
    
    const response = {
      call_id: callDetails.call_id,
      agent_id: callDetails.agent_id,
      call_status: callDetails.call_status,
      start_timestamp: callDetails.start_timestamp,
      end_timestamp: callDetails.end_timestamp,
      transcript: callDetails.transcript || 'Transcript not available yet',
      recording_url: callDetails.recording_url || null,
      call_analysis: callDetails.call_analysis || null,
      duration: callDetails.end_timestamp && callDetails.start_timestamp 
        ? Math.round((callDetails.end_timestamp - callDetails.start_timestamp) / 1000) 
        : 0
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error retrieving call:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PHONE NUMBER MANAGEMENT ENDPOINTS
// ============================================

// Get all owned phone numbers
app.get('/api/phone-numbers/list', async (req, res) => {
  try {
    const response = await retellClient.phoneNumber.list();
    res.json({
      success: true,
      phoneNumbers: response,
      count: response.length
    });
  } catch (error) {
    console.error('Error listing phone numbers:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Search available phone numbers by area code
app.post('/api/phone-numbers/search', async (req, res) => {
  try {
    const { areaCode } = req.body;
    
    if (!areaCode) {
      return res.status(400).json({
        success: false,
        error: 'Area code is required'
      });
    }

    console.log('🔍 Searching for numbers with area code:', areaCode);
    
    const response = await retellClient.phoneNumber.list({
      area_code: parseInt(areaCode)
    });
    
    res.json({
      success: true,
      availableNumbers: response,
      count: response.length
    });
  } catch (error) {
    console.error('Error searching phone numbers:', error);
    res.status(500).json({ 
      success: false,
      error: error.error?.error_message || error.message 
    });
  }
});

// Buy/Import a phone number
app.post('/api/phone-numbers/buy', async (req, res) => {
  try {
    const { phoneNumber, areaCode, agentId } = req.body;
    
    if (!phoneNumber && !areaCode) {
      return res.status(400).json({
        success: false,
        error: 'Either phone number or area code is required'
      });
    }

    console.log('💰 Buying phone number...');
    
    const purchaseData = {};
    
    if (phoneNumber) {
      purchaseData.phone_number = phoneNumber;
    } else {
      purchaseData.area_code = parseInt(areaCode);
    }
    
    // Add agent ID if provided
    if (agentId) {
      purchaseData.agent_id = agentId;
    }
    
    console.log('Purchase data:', purchaseData);
    
    const newNumber = await retellClient.phoneNumber.create(purchaseData);
    
    console.log('✅ Phone number purchased:', newNumber.phone_number);
    
    res.json({
      success: true,
      phoneNumber: newNumber,
      message: 'Phone number purchased successfully'
    });
  } catch (error) {
    console.error('❌ Error buying phone number:', error);
    res.status(500).json({ 
      success: false,
      error: error.error?.error_message || error.message 
    });
  }
});

// Update phone number (assign to agent, change settings)
app.patch('/api/phone-numbers/:phoneNumberId/update', async (req, res) => {
  try {
    const { phoneNumberId } = req.params;
    const { agentId, inboundWebhookUrl } = req.body;
    
    console.log('📝 Updating phone number:', phoneNumberId);
    
    const updateData = {};
    
    if (agentId) {
      updateData.agent_id = agentId;
    }
    
    if (inboundWebhookUrl) {
      updateData.inbound_webhook_url = inboundWebhookUrl;
    }
    
    const updatedNumber = await retellClient.phoneNumber.update(
      phoneNumberId,
      updateData
    );
    
    console.log('✅ Phone number updated');
    
    res.json({
      success: true,
      phoneNumber: updatedNumber,
      message: 'Phone number updated successfully'
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ 
      success: false,
      error: error.error?.error_message || error.message 
    });
  }
});

// Delete/Release a phone number
app.delete('/api/phone-numbers/:phoneNumberId/delete', async (req, res) => {
  try {
    const { phoneNumberId } = req.params;
    
    console.log('🗑️ Deleting phone number:', phoneNumberId);
    
    await retellClient.phoneNumber.delete(phoneNumberId);
    
    console.log('✅ Phone number deleted');
    
    res.json({
      success: true,
      message: 'Phone number deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting phone number:', error);
    res.status(500).json({ 
      success: false,
      error: error.error?.error_message || error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📞 Agent Management API ready`);
  console.log(`☎️ Phone Number Management API ready`);
});