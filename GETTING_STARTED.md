# 🚀 TitansGym Quick Start Guide

Follow these commands to get your backend and mobile app running simultaneously.

## 1. Start the Backend (Laravel)
Open a terminal in the root directory (`TitansGym_System/`) and run:
```bashphp artisan serve --host=0.0.0.0

```
*Your backend will be accessible at: http://localhost:8000 (and on your local network IP).*

---

## 2. Start the Frontend Assets (Vite)
Open a **new** terminal in the root directory and run:
```bash
npm run dev
```
*This is required for the web portal's CSS and JavaScript to load.*

---

## 3. Start the Mobile App (Expo)
Open a **new** terminal, navigate to the mobile folder, and start Expo:
```bash
cd TitansGymMobile
npx expo start
```
*Press **'a'** for Android, **'i'** for iOS, or scan the QR code with the **Expo Go** app on your phone.*

---

## 🛠️ Proxy Setup (Optional - for Claude Code)
If you are using the Claude Code terminal proxy:
```bash
# Terminal 1
free-claude-code

# Terminal 2
$env:ANTHROPIC_AUTH_TOKEN="freecc"; $env:ANTHROPIC_BASE_URL="http://localhost:8082"; claude
```

---

## 🔐 Default Credentials
- **Admin:** admin@example.com / password
- **Trainer:** trainer@example.com / password
- **Member:** member@example.com / password
- **Cashier:** cashier@gym.com / password
