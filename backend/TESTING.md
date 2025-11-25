# 🧪 Testing Guide for Beginners

Welcome! This guide will teach you how to write and run tests for the VibeBox backend.

## What Are Tests?

Tests are small programs that check if your code works correctly. Think of them like a checklist:
- ✅ Does my search API return songs?
- ✅ Does it handle empty searches?
- ✅ Does each song have a title and artist?

## Why Write Tests?

1. **Catch bugs early** - Tests find problems before users do
2. **Confidence** - You know your code works
3. **Documentation** - Tests show how your API should work
4. **Safety** - Change code without breaking things

## How to Run Tests

### Step 1: Make sure your server is running
```bash
npm start
```

### Step 2: Open a NEW terminal window

### Step 3: Run the tests
```bash
npm test
```

You should see output like:
```
✓ Should return songs when searching for "Hindi"
✓ Should return empty array when search query is empty
✓ Should return a list of popular tracks
...
```

## Understanding Test Files

### Basic Structure
```javascript
// Group related tests together
describe('Search API', () => {
    // Individual test
    test('Should return songs', async () => {
        // Test code here
    });
});
```

### Common Test Commands

#### Making requests
```javascript
const response = await request(baseURL)
    .get('/api/search?q=Hindi')  // Make a GET request
    .expect(200);  // Expect status 200
```

#### Checking results (Assertions)
```javascript
expect(response.body).toBe(something);  // Exact match
expect(array.length).toBeGreaterThan(0);  // Greater than
expect(object).toHaveProperty('title');  // Has property
expect(Array.isArray(data)).toBe(true);  // Is an array
```

## Writing Your First Test

Let's write a simple test together:

```javascript
test('Should return tracks for romantic mood', async () => {
    // Step 1: Make the request
    const response = await request(baseURL)
        .get('/api/tracks/mood/romantic')
        .expect(200);
    
    // Step 2: Check we got an array
    expect(Array.isArray(response.body)).toBe(true);
    
    // Step 3: Check we got some results
    expect(response.body.length).toBeGreaterThan(0);
});
```

## Test Results

### When tests pass ✅
```
PASS  tests/api.test.js
  🔍 Search API
    ✓ Should return songs when searching for "Hindi" (523 ms)
    ✓ Should return empty array when search query is empty (102 ms)
```

### When tests fail ❌
```
FAIL tests/api.test.js
  🔍 Search API
    ✕ Should return songs when searching for "Hindi" (103 ms)

  Expected: array
  Received: undefined
```

The error message tells you:
- Which test failed
- What was expected
- What actually happened

## Useful Commands

```bash
# Run all tests once
npm test

# Re-run tests automatically when you change code
npm test:watch

# Run only one test file
npm test api.test.js
```

## Tips for Beginners

1. **One thing per test** - Don't test everything in one test
2. **Clear names** - Name tests so you know what they check
3. **Comments help** - Explain tricky parts with comments
4. **Start simple** - Begin with basic tests, add more later
5. **Run often** - Test after every change

## Common Mistakes

### Mistake 1: Server not running
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Fix:** Start your server with `npm start` first!

### Mistake 2: Timeout errors
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```
**Fix:** API calls can be slow. Our config sets 30 second timeout.

### Mistake 3: Wrong expectations
```
Expected: "Happy Song"
Received: "Sad Song"
```
**Fix:** Check your test logic - is it testing the right thing?

## Next Steps

Now that you understand the basics:

1. ✅ Run `npm test` to see the tests pass
2. Try adding a new test for a different mood
3. Try breaking something and see the test fail
4. Fix it and watch the test pass again!

## Need Help?

- Check the comments in `tests/api.test.js`
- Read Jest docs: https://jestjs.io/docs/getting-started
- Read Supertest docs: https://github.com/ladjs/supertest

Happy testing! 🎉
