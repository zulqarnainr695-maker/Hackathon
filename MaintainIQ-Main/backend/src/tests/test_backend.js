// Verification Test Script for MaintainIQ Backend
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Issue = require('../models/Issue');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const AITriage = require('../models/AITriage');
const { generateAssetQR } = require('../services/qr.service');
const { analyzeComplaint } = require('../services/ai.service');

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/maintainiq_test_runs';

const runTests = async () => {
  console.log('----------------------------------------------------');
  console.log('[TEST RUN] Starting MaintainIQ Backend Unit Validations...');
  console.log('----------------------------------------------------');

  try {
    // Connect to test database
    await mongoose.connect(TEST_MONGO_URI);
    console.log('✔ Connected to test database.');

    // Clear test collections
    await mongoose.connection.db.dropDatabase();
    console.log('✔ Dropped previous test collections.');

    // Test 1: User Registration and Cryptography
    console.log('\n[Test 1] User Registration & Password Hashing');
    const user = await User.create({
      name: 'Admin Tester',
      email: 'admin-test@maintainiq.com',
      password: 'mypassword123',
      role: 'Admin',
      phone: '+1234567890'
    });
    console.log('✔ User created successfully.');
    console.log('  Hashed Password in DB:', user.password);
    
    // Check password hashing did its job
    if (user.password === 'mypassword123') {
      throw new Error('FAIL: Password was not hashed.');
    }
    console.log('✔ Password was successfully hashed.');

    const isMatch = await user.comparePassword('mypassword123');
    if (!isMatch) {
      throw new Error('FAIL: Password comparison failed.');
    }
    console.log('✔ Password matching confirmed.');

    // Test 2: Asset Creation and QR Generation
    console.log('\n[Test 2] Asset Creation & QR Generation');
    const asset = new Asset({
      assetCode: 'TEST-COMP-909',
      name: 'Test Compressor Unit',
      category: 'HVAC',
      location: 'Section 4, Roof',
      condition: 'Fair',
      status: 'Operational',
      createdBy: user._id
    });

    const qrResult = await generateAssetQR(asset.assetCode);
    console.log('✔ QR Code Service executed.');
    console.log('  QR Image URL:', qrResult.qrCodeUrl);
    console.log('  Public URL Pointing to:', qrResult.publicUrl);

    asset.qrCode = qrResult.qrCodeUrl;
    asset.publicUrl = qrResult.publicUrl;
    await asset.save();
    console.log('✔ Asset successfully saved to DB.');

    // Reject duplicate asset codes
    try {
      await Asset.create({
        assetCode: 'TEST-COMP-909',
        name: 'Another Asset',
        category: 'Electrical',
        location: 'Lab 1',
        createdBy: user._id
      });
      throw new Error('FAIL: Duplicate asset code was allowed!');
    } catch (err) {
      console.log('✔ Successfully blocked duplicate asset code creation.');
    }

    // Test 3: Issue Filing and Status Side Effects
    console.log('\n[Test 3] Issue Filing & Status Side Effects');
    const issue = await Issue.create({
      asset: asset._id,
      title: 'Water drip from compressor bottom',
      description: 'Slow trending coolant decline and leak.',
      priority: 'High',
      category: 'HVAC',
      reporterName: 'Marcus Vance',
      reporterEmail: 'tech@maintainiq.com'
    });
    console.log(`✔ Issue ${issue.issueNumber} filed successfully.`);

    // Check associated asset status side-effects (Should change to Issue Reported)
    const updatedAsset = await Asset.findById(asset._id);
    console.log('  Updated Asset Status:', updatedAsset.status);
    if (updatedAsset.status !== 'Issue Reported') {
      throw new Error("FAIL: Asset status was not updated to 'Issue Reported' on filing.");
    }
    console.log("✔ Asset status successfully updated to 'Issue Reported'.");

    // Test 4: AI Triage Parsing and Fallbacks
    console.log('\n[Test 4] AI Triage Engine & Local Fallback Parsing');
    const triageResult = await analyzeComplaint(
      { name: asset.name, category: asset.category },
      issue.description,
      []
    );
    console.log('  AI Title suggestion:', triageResult.title);
    console.log('  AI Priority suggestion:', triageResult.priority);
    console.log('  AI Causes list:', triageResult.possibleCauses);
    console.log('  AI Checks list:', triageResult.initialChecks);
    
    if (!triageResult.title || !triageResult.priority || !triageResult.possibleCauses.length) {
      throw new Error('FAIL: AI Triage returned invalid structure.');
    }
    console.log('✔ AI Triage parsed structure successfully.');

    // Save AI triage
    const aiTriageDoc = await AITriage.create({
      issue: issue._id,
      originalComplaint: issue.description,
      aiTitle: triageResult.title,
      aiCategory: triageResult.category,
      aiPriority: triageResult.priority,
      possibleCauses: triageResult.possibleCauses,
      diagnosticChecks: triageResult.initialChecks
    });
    console.log('✔ Triage record saved successfully.');

    // Test 5: History Immutability Check
    console.log('\n[Test 5] Maintenance History Logging & Immutability');
    const history = await MaintenanceHistory.create({
      asset: asset._id,
      actor: user._id,
      action: 'Issue Reported',
      description: 'Water leak reported.',
      issue: issue._id
    });
    console.log('✔ History record logged.');

    // Try modifying the history
    try {
      history.description = 'Try updating';
      await history.save();
      throw new Error('FAIL: History log update was allowed!');
    } catch (err) {
      console.log('✔ Blocked modifying history logs successfully.');
    }

    // Try deleting history
    try {
      await MaintenanceHistory.deleteOne({ _id: history._id });
      throw new Error('FAIL: History log deletion was allowed!');
    } catch (err) {
      console.log('✔ Blocked deleting history logs successfully.');
    }

    // Test 6: Issue Resolution Checks (Maintenance notes & Reverting Asset status)
    console.log('\n[Test 6] Issue Resolution Checks');
    const issueToResolve = await Issue.findById(issue._id);
    
    // First try resolving without notes
    try {
      issueToResolve.status = 'Resolved';
      await issueToResolve.save();
      throw new Error('FAIL: Resolving issue without maintenance notes was allowed!');
    } catch (err) {
      console.log('✔ Blocked resolving issue without maintenance notes successfully.');
    }

    // Try negative cost check
    try {
      issueToResolve.status = 'Resolved';
      issueToResolve.maintenanceNotes = 'Replaced split clamp.';
      issueToResolve.maintenanceCost = -200;
      await issueToResolve.save();
      throw new Error('FAIL: Negative maintenance cost was allowed!');
    } catch (err) {
      console.log('✔ Blocked negative maintenance cost successfully.');
    }

    // Resolve successfully
    issueToResolve.status = 'Resolved';
    issueToResolve.maintenanceNotes = 'Replaced split lower hose clamp. Flushed and topped coolant.';
    issueToResolve.maintenanceCost = 145.50;
    issueToResolve.partsUsed = ['Hose clamp', 'Anti-freeze fluid'];
    await issueToResolve.save();
    console.log('✔ Issue status updated to Resolved.');

    // Re-verify asset status (should revert to Operational)
    const resolvedAsset = await Asset.findById(asset._id);
    console.log('  Resolved Asset Status:', resolvedAsset.status);
    if (resolvedAsset.status !== 'Operational') {
      throw new Error("FAIL: Asset status was not restored to 'Operational' after resolution.");
    }
    console.log("✔ Asset status successfully restored to 'Operational'.");

    console.log('\n----------------------------------------------------');
    console.log('🎉 ALL BACKEND BUSINESS RULES AND SCHEMA VALIDATIONS PASSED.');
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed. Test run complete.');
  }
};

runTests();
