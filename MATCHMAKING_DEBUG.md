# Matchmaking Debugging Guide

## 🔍 Current Issue
Matchmaking keeps searching and doesn't connect users.

## ✅ What I've Added

1. **Enhanced Logging** - Check your server console and browser console for detailed logs
2. **Connection Status** - The UI now shows WebSocket connection status
3. **Queue Status** - Shows how many people are in the queue
4. **Immediate Matching** - When 2+ users join, matching happens immediately

## 🐛 Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check the Console tab. Look for:
- `[Client] WebSocket connected` - Should appear when page loads
- `[Client] Join queue response` - Should show success when clicking "Find a Chat Partner"
- Any error messages

### Step 2: Check Server Console
Look at your terminal where `npm run dev` is running. You should see:
- `[WebSocket] New connection attempt`
- `[WebSocket] Client connected: <userId>`
- `[Matchmaking] User added to queue: <userId>`
- `[Matchmaking] Match found: <match details>`

### Step 3: Test WebSocket Connection

1. **Open two different browsers** (or incognito windows):
   - Browser 1: Chrome (logged in as User A)
   - Browser 2: Firefox/Edge (logged in as User B)

2. **Or use two different devices**:
   - Device 1: Your computer (localhost:5000)
   - Device 2: Your phone (192.168.x.x:5000)

3. **Make sure both users are logged in** with different accounts

### Step 4: Check Authentication

The WebSocket requires authentication. If you see:
- `[WebSocket] No session ID, closing connection` - User is not logged in
- `[WebSocket] Invalid session, closing connection` - Session expired or invalid

**Solution**: Make sure you're logged in before accessing the matchmaking page.

### Step 5: Verify Queue Status

When you click "Find a Chat Partner", check:
1. Browser console should show: `[Client] Join queue response: 200`
2. Server console should show: `[Matchmaking] User added to queue: <userId>`
3. UI should show: "People in queue: 1" (then 2 when second user joins)

## 🔧 Common Issues & Fixes

### Issue 1: WebSocket Not Connecting
**Symptoms**: UI shows "❌ Disconnected"

**Possible Causes**:
- Not logged in
- Session expired
- Cookie issues

**Fix**:
1. Log out and log back in
2. Clear browser cookies
3. Check server console for authentication errors

### Issue 2: Users Not Matching
**Symptoms**: Both users in queue but no match

**Possible Causes**:
- Same user ID (testing with same account)
- WebSocket not connected for one user
- Matchmaking algorithm issue

**Fix**:
1. Make sure you're using **two different user accounts**
2. Check both browser consoles - both should show "WebSocket connected"
3. Check server console - should show both users in queue
4. Wait a few seconds - matching happens every 50ms

### Issue 3: Network Access Issues
**Symptoms**: Works on localhost but not on network IP

**Possible Causes**:
- Firewall blocking WebSocket connections
- Different sessions on different IPs

**Fix**:
1. Check Windows Firewall - allow port 5000
2. Make sure both devices are on same network
3. Try accessing both from same IP (localhost for both)

## 📊 Testing Checklist

- [ ] User 1: WebSocket connected ✅
- [ ] User 2: WebSocket connected ✅
- [ ] User 1: Clicked "Find a Chat Partner" ✅
- [ ] User 1: Shows "People in queue: 1" ✅
- [ ] User 2: Clicked "Find a Chat Partner" ✅
- [ ] User 2: Shows "People in queue: 2" ✅
- [ ] Server console: Shows both users added ✅
- [ ] Server console: Shows "Match found" ✅
- [ ] Both users: See "Match Found!" message ✅

## 🚀 Quick Test

1. Open two browser windows (or incognito)
2. Log in as different users in each
3. Both go to `/matchmaking`
4. Both click "Find a Chat Partner"
5. Should match within 1-2 seconds

## 📝 What to Report

If it still doesn't work, please share:
1. Browser console logs (from both browsers)
2. Server console logs
3. Screenshot of the matchmaking page showing queue status
4. Whether you're testing with:
   - Same computer, different browsers
   - Different devices
   - Same browser, different tabs (won't work - need different sessions)

