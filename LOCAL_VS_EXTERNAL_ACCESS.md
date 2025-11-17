# 🏠 Local vs External Access Guide

## The Issue

When you access **GitHub Pages from the same machine** running the server:
- Browser detects Tailscale Funnel as a tunnel to local resources
- Shows **Private Network Access (PNA) prompt**
- This is expected browser security behavior

## Solution: Use Different Access Methods

### For Local Access (No PNA Prompt)

**Use the local frontend** instead of GitHub Pages:

1. **Start the local frontend:**
   ```powershell
   cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm\frontend"
   npm run dev
   ```

2. **Access at**: http://localhost:3000 (or the port shown)
   - Uses `http://localhost:3002` for backend
   - **No PNA prompt** ✅
   - **No Tailscale needed** ✅

### For External Access (GitHub Pages)

**External users** access via GitHub Pages:
- URL: https://bennyg83.github.io/pilzno_crm/
- Uses Tailscale Funnel: `https://crm-mini.tail34e202.ts.net`
- **May show PNA prompt** (they can click "Allow")
- **Works from anywhere** ✅

## Current Configuration

### Local Development
- **Frontend**: http://localhost:3000 (via `npm run dev`)
- **Backend**: http://localhost:3002
- **No PNA prompt** ✅

### GitHub Pages (External)
- **Frontend**: https://bennyg83.github.io/pilzno_crm/
- **Backend**: https://crm-mini.tail34e202.ts.net (Tailscale Funnel)
- **PNA prompt possible** (expected behavior)

## Quick Reference

| Access Method | URL | Backend | PNA Prompt? |
|--------------|-----|---------|-------------|
| **Local Dev** | http://localhost:3000 | localhost:3002 | ❌ No |
| **GitHub Pages (Local)** | https://bennyg83.github.io/pilzno_crm/ | Tailscale Funnel | ⚠️ Yes (expected) |
| **GitHub Pages (External)** | https://bennyg83.github.io/pilzno_crm/ | Tailscale Funnel | ⚠️ Maybe (they can Allow) |

## Best Practice

**For local testing/development:**
- Use `npm run dev` → http://localhost:3000
- No PNA prompt
- Faster development

**For external users:**
- Use GitHub Pages → https://bennyg83.github.io/pilzno_crm/
- Tailscale Funnel handles connectivity
- PNA prompt is acceptable (one-time click)

## Why PNA Prompt Appears

The browser's **Private Network Access (PNA)** policy detects:
1. You're accessing a public site (GitHub Pages)
2. That site tries to connect to a local resource (via Tailscale Funnel)
3. Browser shows prompt for security

**This is normal and expected behavior** - it's the browser protecting your local network.

## Alternative: Eliminate PNA Prompt

If you want to eliminate the PNA prompt completely, you can use **DuckDNS + Caddy** instead of Tailscale Funnel:

1. **Pros**: No PNA prompt, true public endpoint
2. **Cons**: Requires router port forwarding (ports 80, 443)

See `ELIMINATE_PNA_PROMPT_GUIDE.md` for details.

---

**Recommendation**: Use local frontend for local access, GitHub Pages for external access.

