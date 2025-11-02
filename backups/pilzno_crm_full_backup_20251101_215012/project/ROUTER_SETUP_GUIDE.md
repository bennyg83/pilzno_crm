# 🌐 Router Port Forwarding Setup Guide

## 🎯 **Goal**
Make your Pilzno Synagogue Management System accessible from the internet via `89.138.168.239`

## 📍 **Current Network Setup**
- **Your Computer IP**: `10.100.102.4`
- **Router IP**: `10.100.102.1`
- **External IP**: `89.138.168.239`
- **Network**: `10.100.102.0/24`

## 🔧 **Step-by-Step Router Configuration**

### **Step 1: Access Router Admin Panel**
1. Open your browser
2. Go to: `http://10.100.102.1`
3. Login with router credentials (check router label or ask ISP)

### **Step 2: Find Port Forwarding Section**
Look for one of these options in your router menu:
- **Port Forwarding**
- **Virtual Server**
- **NAT Rules**
- **Port Mapping**
- **Applications & Gaming**

### **Step 3: Configure Port Forwarding Rules**

#### **Frontend (Port 3000)**
| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Frontend |
| **External Port** | 3000 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 3000 |
| **Protocol** | TCP |

#### **Backend (Port 3001)**
| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend |
| **External Port** | 3001 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 3001 |
| **Protocol** | TCP |

#### **Database (Port 5433) - Optional**
| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Database |
| **External Port** | 5433 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 5433 |
| **Protocol** | TCP |

### **Step 4: Save and Apply**
1. Click **Save** or **Apply**
2. Wait for router to restart (if prompted)
3. Test the configuration

## 🧪 **Testing External Access**

### **Test 1: Local Network (Should Work)**
- Frontend: `http://10.100.102.4:3000` ✅
- Backend: `http://10.100.102.4:3001/health` ✅

### **Test 2: External Network (After Router Setup)**
- Frontend: `http://89.138.168.239:3000` 🎯
- Backend: `http://89.138.168.239:3001/health` 🎯

### **Test 3: Online Port Checker**
Visit: `https://canyouseeme.org/`
- Test port 3000
- Test port 3001

## 🚨 **Common Router Brands & Locations**

### **TP-Link**
- **Menu**: Forwarding → Virtual Servers
- **Add New**: Click "Add New"

### **Netgear**
- **Menu**: Advanced → Port Forwarding
- **Add**: Click "Add Custom Service"

### **Asus**
- **Menu**: WAN → Virtual Server / Port Forwarding
- **Add**: Click "Add Profile"

### **Linksys**
- **Menu**: Applications & Gaming → Port Range Forwarding
- **Add**: Fill in the form

### **Generic/ISP Router**
- **Menu**: Advanced → Port Forwarding
- **Add**: Look for "Add Rule" or "New Entry"

## ⚠️ **Security Considerations**

### **Before Going Live**
- [ ] Change default router password
- [ ] Use strong passwords
- [ ] Consider IP whitelisting
- [ ] Monitor access logs

### **Production Recommendations**
- [ ] Use HTTPS (SSL/TLS)
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Backup configurations

## 🔍 **Troubleshooting**

### **Port Still Not Accessible?**
1. **Check Router Logs**: Look for blocked connections
2. **Verify IP Address**: Ensure `10.100.102.4` is correct
3. **Test Local Access**: Confirm `http://10.100.102.4:3000` works
4. **Check ISP**: Some ISPs block certain ports
5. **Firewall**: Ensure Windows Firewall allows the ports

### **ISP Blocking Ports?**
Common blocked ports:
- **Port 25** (SMTP)
- **Port 80** (HTTP) - Some ISPs block
- **Port 443** (HTTPS) - Some ISPs block

**Solution**: Use non-standard ports like 3000, 3001 (which you're already using)

## 📞 **Need Help?**

If you're still having issues:
1. Check your router's user manual
2. Contact your ISP for port forwarding support
3. Look for router-specific guides online

## ✅ **Success Checklist**

- [ ] Router port forwarding configured
- [ ] `http://89.138.168.239:3000` accessible from external network
- [ ] `http://89.138.168.239:3001/health` returns health status
- [ ] Can access from mobile device (mobile data, not WiFi)
- [ ] Port checker shows ports as open

---

**🎉 Once completed, your Pilzno Synagogue Management System will be accessible from anywhere on the internet!**
