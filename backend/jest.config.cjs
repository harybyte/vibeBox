module.exports = {
    // Tell Jest this is a Node.js environment (not a browser)
    testEnvironment: 'node',

    // Where to find test files
    testMatch: [
        '**/tests/**/*.test.js'  // Any file ending in .test.js in the tests folder
    ],

    // Show more detailed test results
    verbose: true,

    // Timeout for each test (30 seconds - API calls can be slow)
    testTimeout: 30000
};
