# 🔍 CapDetector — AI-Powered WhatsApp Fact Checker

CapDetector is a WhatsApp chatbot that helps users identify potential misinformation using **Google Gemini AI** and the **Twilio WhatsApp API**.

Simply forward a suspicious message, image, or voice note, and CapDetector analyzes the content and provides an easy-to-understand verdict along with supporting reasoning and safety guidance.

---

## 🎥 Demo Video

See CapDetector in action:

**▶️ Demo:** *(Add your YouTube/GitHub video link here)*

### What the demo covers

* ✅ Fact-checking forwarded text messages
* 📸 Analyzing screenshots and images
* 🎙️ Processing voice messages
* 🚩 Detecting misinformation red flags
* 📊 Generating verdicts with confidence scores

> **Beta Notice:** CapDetector currently uses the free tier of Google Gemini APIs. Occasionally, requests may be delayed or fail due to API rate limits or temporary server overload on Google's side. If that happens, simply resend the message after a few minutes.

---

## ✨ Features

* 🤖 AI-powered fact-checking using Google Gemini
* 📸 Image and screenshot analysis
* 🎙️ Voice message support
* 📊 Confidence-based verdicts
* 🚩 Misinformation red-flag detection
* 💡 Safety recommendations for users
* 🌐 Multilingual support (Beta)
* ⚡ Real-time WhatsApp integration

---

## 📋 What It Returns

For every forwarded message, image, or voice note, the bot replies with:

| Field          | Example                           |
| -------------- | --------------------------------- |
| **Verdict**    | `FAKE` / `REAL` / `UNVERIFIABLE`  |
| **Confidence** | `92%`                             |
| **Reason**     | Short explanation of the verdict  |
| **Red Flags**  | List of suspicious elements found |
| **Safety Tip** | Actionable advice for the user    |

### Example Reply

```text
🔍 CAPDETECTOR

🚨 Verdict: FAKE
📊 Confidence: 91%

📝 Reason:
This claim has been repeatedly debunked by WHO and health authorities worldwide.
The message uses classic fear-mongering language to pressure sharing.

🚩 Red Flags:
• No credible source cited
• Uses emotional manipulation ("SHARE BEFORE DELETED")
• Contains fabricated statistics
• Anonymous attribution ("doctors say...")

💡 Safety Tip:
Always verify health claims on official WHO or government health websites before forwarding.
```

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* Google Gemini AI
* Twilio WhatsApp API
* Render
* ngrok (Local Development)

---

## 📦 Prerequisites

Before running the project, ensure you have:

* Node.js v18 or higher
* Twilio Account
* Google Gemini API Key
* ngrok (for local development)

---

## ⚡ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/capdetector.git

cd capdetector
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
GEMINI_API_KEY=
PORT=3000
```

### 4. Get Required Credentials

#### Twilio Credentials

1. Log in to Twilio Console
2. Navigate to Account Dashboard
3. Copy:

   * Account SID
   * Auth Token

#### Gemini API Key

1. Open Google AI Studio
2. Create an API Key
3. Paste it into `.env`

---

## 📱 Set Up Twilio WhatsApp Sandbox

1. Open Twilio Console
2. Navigate to:

```text
Messaging → Try It Out → Send a WhatsApp Message
```

3. Join the Sandbox by sending the provided code to the Twilio WhatsApp number.
4. Keep this page open for webhook configuration later.

---

## 🚀 Start the Server

### Production Mode

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

Expected output:

```text
🚀 CapDetector is running!
📡 Listening on port 3000
🔗 Webhook URL: http://localhost:3000/webhook
```

---

## 🌐 Expose the Server with ngrok

Open a new terminal:

```bash
ngrok http 3000
```

You'll receive a public URL:

```text
https://abcd-1234.ngrok-free.app
```

Copy this URL.

---

## 🔗 Configure Twilio Webhook

In Twilio Sandbox settings:

**When a message comes in**

```text
https://your-ngrok-url.ngrok-free.app/webhook
```

Method:

```text
POST
```

Click **Save**.

---

## 💬 Usage

After setup:

### Greeting

Send:

```text
hi
```

or

```text
hello
```

CapDetector will respond with usage instructions.

### Fact-Checking

Forward any:

* Text message
* Screenshot
* Image
* Voice note

The bot will analyze the content and return a verdict.

---

## 📁 Project Structure

```text
capdetector/
├── .env
├── .gitignore
├── package.json
├── server.js
├── lib/
│   ├── gemini.js
│   └── formatter.js
├── README.md
```

---

## 🚀 Deployment

Deploy to any cloud platform that provides HTTPS support.

| Platform | Deployment           |
| -------- | -------------------- |
| Railway  | railway up           |
| Render   | Connect GitHub Repo  |
| Fly.io   | fly launch           |
| Heroku   | git push heroku main |

After deployment, update your Twilio webhook URL with your production endpoint.

---

## 🔒 Security Notes

* Never commit `.env` files
* Keep API keys private
* Rotate keys if exposed
* Validate incoming Twilio requests in production
* Enable rate limiting for public deployments

---

## 🧪 Current Limitations

* Uses Gemini free-tier APIs
* May experience occasional API rate limits
* Responses depend on AI-generated analysis
* Regional Indian language support is still under development
* WhatsApp Sandbox is intended for testing and demonstrations

---

## 🤝 Contributing

Contributions, feature requests, and feedback are welcome.

Feel free to fork the repository, open issues, or submit pull requests.

---

## 📜 License

MIT License

---

## ⭐ Support the Project

If you found this project useful, consider giving the repository a star.

It helps others discover the project and motivates future improvements.
