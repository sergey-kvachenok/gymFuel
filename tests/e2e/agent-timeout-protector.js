#!/usr/bin/env node

/**
 * Agent Timeout Protector
 *
 * This system prevents agents from getting stuck during test execution.
 * It provides automatic timeout management and force termination capabilities.
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const DEFAULT_CONFIG = {
  maxTestTime: 60000, // 1 minute
  maxNoProgressTime: 30000, // 30 seconds
  forceExit: true,
  killAllPlaywright: true,
};

/**
 * Agent Timeout Protector Class
 * Provides comprehensive timeout protection for agent operations
 */
class AgentTimeoutProtector {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = Date.now();
    this.lastProgressTime = Date.now();
    this.timeouts = [];
    this.processes = [];
  }

  /**
   * Start protection for a test execution
   */
  startProtection(testName) {
    console.log(`🛡️ Starting timeout protection for: ${testName}`);

    // Set up test timeout
    const testTimeout = setTimeout(() => {
      console.error(`⏰ Test timeout exceeded (${this.config.maxTestTime}ms): ${testName}`);
      this.forceTermination('test-timeout');
    }, this.config.maxTestTime);

    // Set up no-progress timeout
    const progressTimeout = setTimeout(() => {
      console.error(
        `⏰ No progress timeout exceeded (${this.config.maxNoProgressTime}ms): ${testName}`,
      );
      this.forceTermination('no-progress');
    }, this.config.maxNoProgressTime);

    this.timeouts.push(testTimeout, progressTimeout);
  }

  /**
   * Update progress (call this when test makes progress)
   */
  updateProgress() {
    this.lastProgressTime = Date.now();
    console.log(`📈 Progress updated at ${new Date().toISOString()}`);
  }

  /**
   * Register a process for monitoring
   */
  registerProcess(process) {
    this.processes.push(process);
  }

  /**
   * Force termination of all processes and cleanup
   */
  async forceTermination(reason) {
    console.error(`🛑 Force termination triggered: ${reason}`);

    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];

    // Kill all registered processes
    for (const process of this.processes) {
      try {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      } catch (error) {
        console.error('Error killing process:', error);
      }
    }

    // Kill all Playwright processes if configured
    if (this.config.killAllPlaywright) {
      await this.killAllPlaywrightProcesses();
    }

    // Force exit if configured
    if (this.config.forceExit) {
      console.error('🛑 Force exiting due to timeout');
      process.exit(1);
    }
  }

  /**
   * Kill all Playwright processes
   */
  async killAllPlaywrightProcesses() {
    try {
      console.log('🔪 Killing all Playwright processes...');

      // Kill Playwright processes
      await execAsync('pkill -f "playwright"');

      // Kill browser processes
      await execAsync('pkill -f "chromium"');
      await execAsync('pkill -f "firefox"');
      await execAsync('pkill -f "webkit"');

      console.log('✅ All Playwright processes killed');
    } catch (error) {
      console.error('❌ Error killing Playwright processes:', error);
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];
    this.processes = [];
  }

  /**
   * Get execution duration
   */
  getDuration() {
    return Date.now() - this.startTime;
  }

  /**
   * Get time since last progress
   */
  getTimeSinceLastProgress() {
    return Date.now() - this.lastProgressTime;
  }
}

/**
 * Enhanced test runner with agent protection
 */
class ProtectedTestRunner {
  constructor(config) {
    this.protector = new AgentTimeoutProtector(config);
  }

  /**
   * Run a test with comprehensive protection
   */
  async runTest(testFile, testName) {
    const fullTestName = testName ? `${testFile} - ${testName}` : testFile;

    this.protector.startProtection(fullTestName);

    try {
      // Build Playwright command
      const args = ['test', testFile];
      if (testName) {
        args.push('--grep', testName);
      }
      args.push('--headed', '--timeout', '60000');

      console.log(`🚀 Running protected test: ${fullTestName}`);
      console.log(`📋 Command: npx playwright ${args.join(' ')}`);

      // Spawn Playwright process
      const playwrightProcess = spawn('npx', ['playwright', ...args], {
        stdio: 'inherit',
        env: { ...process.env, FORCE_EXIT_ON_TIMEOUT: 'true' },
      });

      this.protector.registerProcess(playwrightProcess);

      // Monitor process output for progress
      playwrightProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('✅') || output.includes('PASS') || output.includes('FAIL')) {
          this.protector.updateProgress();
        }
      });

      playwrightProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('✅') || output.includes('PASS') || output.includes('FAIL')) {
          this.protector.updateProgress();
        }
      });

      // Wait for process completion
      await new Promise((resolve, reject) => {
        playwrightProcess.on('close', (code) => {
          this.protector.cleanup();

          if (code === 0) {
            console.log('✅ Test completed successfully');
            resolve();
          } else {
            console.log(`❌ Test failed with code ${code}`);
            reject(new Error(`Test failed with code ${code}`));
          }
        });

        playwrightProcess.on('error', (error) => {
          this.protector.cleanup();
          console.error('❌ Test process error:', error);
          reject(error);
        });
      });
    } catch (error) {
      this.protector.cleanup();
      throw error;
    }
  }
}

/**
 * Utility function to run test with protection
 */
async function runProtectedTest(testFile, testName, config) {
  const runner = new ProtectedTestRunner(config);
  await runner.runTest(testFile, testName);
}

// Main execution for command line usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node agent-timeout-protector.js <test-file> [test-name] [timeout-ms]');
    process.exit(1);
  }

  const testFile = args[0];
  const testName = args[1] || undefined;
  const timeoutMs = args[2] ? parseInt(args[2]) : 60000;

  const config = {
    maxTestTime: timeoutMs,
    maxNoProgressTime: Math.min(timeoutMs / 2, 30000),
    forceExit: true,
    killAllPlaywright: true,
  };

  runProtectedTest(testFile, testName, config)
    .then(() => {
      console.log('✅ Protected test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Protected test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  AgentTimeoutProtector,
  ProtectedTestRunner,
  runProtectedTest,
};
