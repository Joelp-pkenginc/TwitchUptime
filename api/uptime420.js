export default async function handler(req, res) {
  const channel = req.query.channel;
  if (!channel) {
    return res.status(400).send("No channel provided");
  }

  try {
    // Get uptime from DecAPI
    const uptimeRes = await fetch(`https://decapi.me/twitch/uptime/${channel}`);
    const uptimeText = await uptimeRes.text();

    if (uptimeText.includes("offline")) {
      return res.send("Stream is offline"); 
    }
    // Parse uptime (e.g. "1 hour 12 minutes 5 seconds")
    const parts = uptimeText.split(" ");
    let seconds = 0;

    for (let i = 0; i < parts.length; i++) {
      const value = parseInt(parts[i]);
      if (isNaN(value)) continue;

      if (parts[i + 1]?.startsWith("hour")) seconds += value * 3600;
      if (parts[i + 1]?.startsWith("minute")) seconds += value * 60;
      if (parts[i + 1]?.startsWith("second")) seconds += value;
    }
    
    if (seconds === 0 && !uptimeText.includes("second")) {
      return res.status(500).send("Couldn't parse uptime");
    }
    
    const target = 4 * 3600 + 20 * 60; // 4:20 = 15,600 seconds
    const remaining = target - seconds;

    if (remaining <= 0) {
      return res.send("🔥 You hit 4:20! 🔥");
    }

    const rh = Math.floor(remaining / 3600);
    const rm = Math.floor((remaining % 3600) / 60);
    const rs = remaining % 60;

    return res.send(
      `${rh}h ${rm}m ${rs}s until uptime 4:20`
    );

  } catch (err) {
    return res.status(500).send("Error calculating uptime");
  }
}
