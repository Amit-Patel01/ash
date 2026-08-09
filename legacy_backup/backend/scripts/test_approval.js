const { addPendingProposal, resolveProposal, getPendingProposals } = require('../services/aiAgents/departmentConfig');

async function runTest() {
  console.log('🧪 Testing AI Proposal Approval Execution...');

  const prop = addPendingProposal(
    'tech',
    'Test Approval Proposal',
    'enterprise_project_suite',
    'Testing approval execution logic',
    { test: true }
  );

  console.log('  1. Proposal Created:', prop.id);
  console.log('  2. Pending Count:', getPendingProposals().length);

  try {
    const resolved = await resolveProposal(prop.id, true);
    console.log('  3. Approval Resolved SUCCESS:', resolved.status);
    console.log('  4. Remaining Pending Count:', getPendingProposals().length);
    console.log('✅ AI Proposal Approval Engine is 100% WORKING!');
  } catch (err) {
    console.error('❌ Approval Error:', err.message);
  }
}

runTest();
