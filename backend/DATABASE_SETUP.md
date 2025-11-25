# 🗄️ How to Set Up a Free MySQL Database (Railway)

Vercel hosts your code, but it doesn't store your data. You need a separate database.
**Railway** is the easiest way to get a free MySQL database.

## Step 1: Create Account
1. Go to [railway.app](https://railway.app)
2. Click **Login** (Login with GitHub is easiest)
3. Agree to Terms

## Step 2: Create Database
1. Click **+ New Project**
2. Select **Provision MySQL**
3. Wait a moment for it to initialize

## Step 3: Get Credentials
1. Click on the **MySQL** card that appeared
2. Go to the **Variables** tab
3. Click "Show" on the variables to see them. You need:
   - `MYSQLHOST` (or `MYSQL_HOST`)
   - `MYSQLUSER` (or `MYSQL_USER`)
   - `MYSQLPASSWORD` (or `MYSQL_PASSWORD`)
   - `MYSQLDATABASE` (or `MYSQL_DATABASE`)

## Step 4: Ready to Deploy!
Once you have these 4 values, come back here.
We will use them when we run the Vercel deployment command.

> **Note:** If Railway asks for a credit card (sometimes required for verification), you can try **PlanetScale** or **Aiven** instead, which also have free tiers.
