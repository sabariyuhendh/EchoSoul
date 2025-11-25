# Network Access Guide for EchoSoul

## ✅ Configuration Complete

Your project is now configured to be accessible from other devices on your local network!

## 🚀 How to Access

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Check the Console Output

When the server starts, you'll see output like:

```
serving on port 5000
Local:    http://localhost:5000
Network:  http://192.168.137.210:5000
```

### 3. Access from Other Devices

**On the same computer:**
- Use: `http://localhost:5000`

**On other devices on the same network (phone, tablet, another computer):**
- Use: `http://192.168.137.210:5000` (replace with your actual network IP)
- Make sure both devices are on the same Wi-Fi network

## 📱 Finding Your Network IP Address

### Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually Wi-Fi or Ethernet).

### Mac/Linux:
```bash
ifconfig
# or
ip addr
```

## 🌐 Accessing from the Internet (Port Forwarding)

If you want to access your project from anywhere on the internet:

### Option 1: Using ngrok (Easiest - Recommended for Testing)

1. Install ngrok: https://ngrok.com/download
2. Run:
   ```bash
   ngrok http 5000
   ```
3. You'll get a public URL like: `https://abc123.ngrok.io`
4. Share this URL to access from anywhere!

### Option 2: Router Port Forwarding (For Permanent Access)

1. **Find your router's admin panel:**
   - Usually: `http://192.168.1.1` or `http://192.168.0.1`
   - Check router manual for default IP

2. **Set up port forwarding:**
   - External Port: `5000` (or any port you prefer)
   - Internal IP: Your computer's local IP (e.g., `192.168.137.210`)
   - Internal Port: `5000`
   - Protocol: TCP

3. **Find your public IP:**
   - Visit: https://whatismyipaddress.com/
   - Your public IP will be shown

4. **Access from internet:**
   - Use: `http://YOUR_PUBLIC_IP:5000`
   - Note: Your public IP may change unless you have a static IP

### Option 3: Using Cloudflare Tunnel (Free & Secure)

1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. Run:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```
3. You'll get a secure HTTPS URL!

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Development Mode:** The current setup is for development. Don't expose sensitive data.

2. **Firewall:** Make sure Windows Firewall allows port 5000:
   - Windows Security → Firewall → Advanced Settings
   - Add inbound rule for port 5000

3. **Production:** For production, use:
   - HTTPS (SSL certificates)
   - Environment variables for secrets
   - Proper authentication
   - Rate limiting

## 🐛 Troubleshooting

### Can't access from other devices?

1. **Check firewall:** Make sure port 5000 is allowed
2. **Same network:** Ensure devices are on the same Wi-Fi
3. **IP address:** Verify you're using the correct network IP
4. **Router settings:** Some routers block device-to-device communication

### WebSocket not working over network?

- Make sure the WebSocket connection uses the network IP, not localhost
- Check that port 5000 is open for WebSocket connections

## 📝 Quick Reference

- **Local access:** `http://localhost:5000`
- **Network access:** `http://YOUR_IP:5000`
- **Internet access:** Use ngrok, port forwarding, or Cloudflare Tunnel

