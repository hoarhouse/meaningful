export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phrase, context } = req.body;

  const prompt = `What does "${phrase}" really mean when said by a ${context.replace('-', ' ')}? 

Please provide:
1. The likely hidden meaning or subtext
2. The emotional motivation behind saying this
3. What they might actually want or need

Keep the response concise but insightful, around 2-3 sentences total.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    res.json({ response: data.content[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}
