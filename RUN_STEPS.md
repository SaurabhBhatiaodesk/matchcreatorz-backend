# Project Run Karne Ke Steps

## Step 1: Environment Files Create Karein

Project root mein 3 files create karein:

### `.env.user` file create karein:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=apna_password
DB_NAME=matchcreators_db

PORT=3000
NODE_ENV=DEVELOPMENT
SERVER_MODE=http

JWT_SECRET=kuch_bhi_random_string_yeh_secret_key_hai

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_password
MAIL_FROM=no-reply@matchcreators.com

TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_MOBILE_NUMBER=+1234567890

STRIPE_SECRET_KEY=sk_test_your_key
```

### `.env.admin` file create karein:
Same as `.env.user` but `PORT=3001` rakhein

### `.env.socket` file create karein:
Same as `.env.user` but `PORT=3002` rakhein

## Step 2: Database Setup

1. MariaDB/MySQL install karein (agar nahi hai)
2. Database create karein:
   ```sql
   CREATE DATABASE matchcreators_db;
   ```
3. `.env` files mein apne database credentials update karein

## Step 3: Project Run Karein

### Option 1: Development Mode (Recommended)

**3 alag terminals open karein:**

**Terminal 1 - User API:**
```bash
npm run start:user:dev
```

**Terminal 2 - Admin API:**
```bash
npm run start:admin:dev
```

**Terminal 3 - Socket API:**
```bash
npm run start:socket:dev
```

### Option 2: Production Mode

Pehle build karein:
```bash
npm run build:dev
```

Phir run karein:
```bash
npm run start:user
npm run start:admin
npm run start:socket
```

## Step 4: Check Karo

Browser mein open karein:
- User API: http://localhost:3000/api-docs
- Admin API: http://localhost:3001/api-docs
- Socket API: http://localhost:3002/socket-docs

## Important Notes

1. **Minimum Required:**
   - Database credentials (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME)
   - JWT_SECRET (kuch bhi random string)

2. **Optional (agar features use karni hain):**
   - Twilio (SMS ke liye)
   - Stripe (payments ke liye)
   - SMTP (email ke liye)

3. **Port Already in Use?**
   - `.env` files mein PORT change kar do

## Troubleshooting

**Database connection error?**
- Database server running hai check karo
- Credentials sahi hain verify karo

**Port already in use?**
- `.env` file mein PORT change karo
- Ya existing process kill karo

**Module not found?**
- `npm install` dobara run karo


