# 🔍 WhatsApp Fake News Detector Bot

A WhatsApp chatbot that fact-checks forwarded messages using **Twilio WhatsApp API** and **Google Gemini AI**. Forward any suspicious message and get an instant verdict.

## 📋 What It Returns

For every forwarded message, the bot replies with:

| Field | Example |
|---|---|
| **Verdict** | `FAKE` / `REAL` / `UNVERIFIABLE` |
| **Confidence** | `92%` |
| **Reason** | Short explanation of the verdict |
| **Red Flags** | List of suspicious elements found |
| **Safety Tip** | Actionable advice for the user |

**Example reply:**
```
🔍 *FAKE NEWS DETECTOR*

🚨 *Verdict:* FAKE
📊 *Confidence:* 91%

📝 *Reason:*
This claim has been repeatedly debunked by WHO and health authorities worldwide.
The message uses classic fear-mongering language to pressure sharing.

🚩 *Red Flags:*
  • No credible source cited
  • Uses emotional manipulation ("SHARE BEFORE DELETED")
  • Contains fabricated statistics
  • Anonymous attribution ("doctors say...")

💡 *Safety Tip:*
Always verify health claims on official WHO or government health websites before forwarding.
```

---

## 🛠️ Prerequisites

- **Node.js** v18 or higher
- **Twilio account** — [Sign up free](https://www.twilio.com/try-twilio)
- **Google Gemini API key** — [Get one here](https://aistudio.google.com/app/apikey)
- **ngrok** (for local development) — [Download](https://ngrok.com/download)

---

## ⚡ Setup

### 1. Install Dependencies

```bash
cd "whatsapp chatbot"
npm install
```

### 2. Configure Environment Variables

Open the `.env` file and fill in your API keys:

```env
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
GEMINI_API_KEY
PORT=3000
```

**Where to find these:**
- `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` → [Twilio Console](https://console.twilio.com/) → Account Info
- `GEMINI_API_KEY` → [Google AI Studio](https://aistudio.google.com/app/apikey) → Get API Key

### 3. Set Up Twilio WhatsApp Sandbox

1. Go to [Twilio Console](https://console.twilio.com/) → **Messaging → Try it out → Send a WhatsApp message**
2. Follow the instructions to join the sandbox by sending the code to the Twilio WhatsApp number
3. Leave the Sandbox settings page open — you'll need it in the next step

### 4. Start the Server

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

You should see:
```
🚀 WhatsApp Fake News Detector is running!
📡 Listening on port 3000
🔗 Webhook URL: http://localhost:3000/webhook
```

### 5. Expose Your Server with ngrok

In a **new terminal window**:

```bash
ngrok http 3000
```

Copy the **Forwarding URL** — it looks like:
```
https://a1b2-c3d4-e5f6.ngrok-free.app
```

### 6. Configure Twilio Webhook

1. Go back to the **Twilio WhatsApp Sandbox** settings
2. In **"When a message comes in"**, paste:
   ```
   https://your-ngrok-url.ngrok-free.app/webhook
   ```
3. Set method to **HTTP POST**
4. Click **Save**

---

## 💬 Usage

Send any WhatsApp message to your Twilio Sandbox number:

- **Say `hi` or `hello`** → Get a welcome message explaining how to use the bot
- **Forward any suspicious message** → Get a full fact-check verdict

---

## 📁 Project Structure

```
whatsapp chatbot/
├── .env                # API keys 
├── .gitignore          # Ignores node_modules and .env
├── package.json        # Dependencies
├── server.js           # Express app + Twilio webhook
├── lib/
│   ├── gemini.js       # Gemini AI fact-checking logic
│   └── formatter.js    # WhatsApp message formatter
└── README.md           # This file
```

---

## 🚀 Deploying to Production

For production, deploy to a cloud provider with a stable HTTPS URL:

| Platform | Command |
|---|---|
| **Railway** | `railway up` |
| **Render** | Connect GitHub repo → Auto deploy |
| **Fly.io** | `fly launch` |
| **Heroku** | `git push heroku main` |

Then update your Twilio Sandbox webhook URL to your production URL.

> **Note:** For production WhatsApp (not Sandbox), you need to apply for a [Twilio WhatsApp Business account](https://www.twilio.com/whatsapp).

---

## 🔒 Security Notes

- Never commit `.env` to version control — it's in `.gitignore`
- For production, validate incoming Twilio requests using `twilio.validateRequest()`
- Rotate your API keys if they are ever accidentally exposed

---

## 📜 License

MIT
