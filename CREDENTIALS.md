# 🔐 TitansGym System - Login Credentials

> ⚠️ **Security Warning**: These are default credentials for development/testing purposes only. **Change all passwords immediately in production!**

---

## 👤 Default User Accounts

### 🔴 Admin Account
| Field | Value |
|-------|-------|
| **Email** | `admin@gym.com` |
| **Password** | `password` |
| **Access Level** | Full system access |
| **Capabilities** | Member management, Trainer management, Reports, Payments, All settings |

---

### 🟢 Trainer Accounts

#### Primary Trainer
| Field | Value |
|-------|-------|
| **Email** | `trainer@gym.com` |
| **Password** | `password` |
| **Name** | John Trainer |
| **Specialization** | Personal Training |
| **Hourly Rate** | $60.00 |

#### Additional Trainers
| Name | Email | Password | Specialization | Hourly Rate |
|------|-------|----------|----------------|-------------|
| Sarah Coach | `sarah@gym.com` | `password` | Yoga & Pilates | $50.00 |
| Mike Strength | `mike@gym.com` | `password` | Strength & Conditioning | $75.00 |

---

### 🔵 Member Accounts

#### Primary Member
| Field | Value |
|-------|-------|
| **Email** | `member@gym.com` |
| **Password** | `password` |
| **Name** | Mike Member |
| **Membership Type** | Premium |

#### Additional Members
| Name | Email | Password | Membership Type |
|------|-------|----------|-----------------|
| Lisa Johnson | `lisa@gym.com` | `password` | VIP |
| John Smith | `john.smith@gym.com` | `password` | Random |
| Emma Wilson | `emma.wilson@gym.com` | `password` | Random |
| David Brown | `david.brown@gym.com` | `password` | Random |
| Sarah Davis | `sarah.davis@gym.com` | `password` | Random |
| Michael Johnson | `michael.johnson@gym.com` | `password` | Random |
| Jennifer Miller | `jennifer.miller@gym.com` | `password` | Random |
| Chris Wilson | `chris.wilson@gym.com` | `password` | Random |
| Amanda Taylor | `amanda.taylor@gym.com` | `password` | Random |
| Robert Clark | `robert.clark@gym.com` | `password` | Random |
| Jessica Lee | `jessica.lee@gym.com` | `password` | Random |

---

## 🎯 Quick Start Login

For quick testing, use these accounts:

```
Admin:   admin@gym.com     / password
Trainer: trainer@gym.com   / password  
Member:  member@gym.com    / password
```

---

## 🔄 Resetting Credentials

To reset the database and regenerate all accounts:

```bash
php artisan migrate:fresh --seed
```

---

## 🛡️ Production Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Remove or disable test accounts
- [ ] Enable HTTPS
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Generate a new `APP_KEY`
- [ ] Configure proper database credentials
- [ ] Set up proper email configuration
- [ ] Enable rate limiting
- [ ] Configure session security

---

*Last Updated: December 10, 2025*