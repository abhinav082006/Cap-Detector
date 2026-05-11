function formatVerdict(result) {
  const verdictEmoji = { FAKE: "🚨", REAL: "✅", UNVERIFIABLE: "⚠️" };
  const emoji = verdictEmoji[result.verdict] || "❓";

  let m = `🔍 *CapDetector*\n\n`;
  m += `${emoji} *Verdict: ${result.verdict}*\n`;
  m += `📊 Confidence: ${result.confidence}\n\n`;
  
  m += `📝 *Reason:*\n${result.reason}\n\n`;

  if (result.redFlags && result.redFlags.length > 0) {
    m += `🚩 *Red Flags:*\n`;
    result.redFlags.forEach(flag => {
      m += `  • ${flag}\n`;
    });
    m += `\n`;
  }

  if (result.sourceLink) {
    m += `🔗 *Source:*\n${result.sourceLink}\n\n`;
  }

  m += `💡 *Safety Tip:*\n${result.safetyTip}\n\n`;
  
  m += `💬 _Ask me follow-up questions!_`;

  return m;
}

function formatWelcome() {
  return `🔍 *Elite Fact-Checker AI*\n\n` +
         `I analyze Text, Images, and *Voice Notes* for misinformation.\n\n` +
         `✅ I detect propaganda tactics\n` +
         `🌍 I support all languages\n` +
         `🔗 I provide real source links\n\n` +
         `Just forward any message to get started!`;
}

function formatError() {
  return `⚠️ *Error Analyzing Message*\n\n` +
         `I encountered a problem. This might be due to a very large file or a temporary connection issue. Please try again!`;
}

module.exports = { formatVerdict, formatError, formatWelcome };
