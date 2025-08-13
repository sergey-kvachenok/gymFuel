#!/usr/bin/env node

/**
 * Test Runner with Timeout Management
 *
 * This script runs Playwright tests with automatic timeout management.
 * If a test exceeds the timeout limit, it will automatically stop the process.
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const TIMEOUT_MS = 30000; // 1 minute
const FORCE_EXIT_ON_TIMEOUT = true;

/**
 * Run a Playwright test with timeout management
 */
function runTestWithTimeout(testFile, testName = null) {
  console.log(`🧪 Running test with ${TIMEOUT_MS}ms timeout...`);

  // Set environment variable for force exit
  process.env.FORCE_EXIT_ON_TIMEOUT = FORCE_EXIT_ON_TIMEOUT.toString();

  // Build Playwright command
  const args = ['test', testFile];
  if (testName) {
    args.push('--grep', testName);
  }
  args.push('--headed', '--timeout', TIMEOUT_MS.toString());

  console.log(`📋 Command: npx playwright ${args.join(' ')}`);

  // Spawn Playwright process
  const playwrightProcess = spawn('npx', ['playwright', ...args], {
    stdio: 'inherit',
    env: { ...process.env, FORCE_EXIT_ON_TIMEOUT: FORCE_EXIT_ON_TIMEOUT.toString() },
  });

  // Set up timeout for the entire process
  const processTimeout = setTimeout(() => {
    console.error(`⏰ Process timeout exceeded (${TIMEOUT_MS}ms)`);
    console.error('🛑 Force killing Playwright process...');

    // Kill the process tree
    playwrightProcess.kill('SIGKILL');

    // Force exit if needed
    if (FORCE_EXIT_ON_TIMEOUT) {
      process.exit(1);
    }
  }, TIMEOUT_MS);

  // Handle process events
  playwrightProcess.on('close', (code) => {
    clearTimeout(processTimeout);
    console.log(`📊 Playwright process exited with code ${code}`);

    if (code === 0) {
      console.log('✅ Test completed successfully');
    } else {
      console.log('❌ Test failed or timed out');
      process.exit(code);
    }
  });

  playwrightProcess.on('error', (error) => {
    clearTimeout(processTimeout);
    console.error('❌ Playwright process error:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, stopping Playwright process...');
    clearTimeout(processTimeout);
    playwrightProcess.kill('SIGTERM');
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, stopping Playwright process...');
    clearTimeout(processTimeout);
    playwrightProcess.kill('SIGTERM');
  });
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node run-test-with-timeout.js <test-file> [test-name]');
    process.exit(1);
  }

  const testFile = args[0];
  const testName = args[1] || null;

  console.log(`🚀 Starting test runner for: ${testFile}`);
  if (testName) {
    console.log(`🎯 Test name filter: ${testName}`);
  }

  runTestWithTimeout(testFile, testName);
}

module.exports = { runTestWithTimeout };
