export default async function handler(req, res) {
  console.log('=== Function started ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phrase, context } = req.body;
    console.log('Parsed input:', { phrase, context });

    if (!phrase || !context) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing phrase or context' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('API key missing from environment');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('API key found, length:', process.env.ANTHROPIC_API_KEY.length);
    console.log('API key starts with:', process.env.ANTHROPIC_API_KEY.substring(0, 10));

    const prompt = `What does "${phrase}" really mean when said by a ${context.replace('-', ' ')}? 

Please provide:
1. The likely hidden meaning or subtext
2. The emotional motivation behind saying this
3. What they might actually want or need

Keep the response concise but insightful, around 2-3 sentences total.`;

    console.log('Making API request to Claude...');

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

    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API error response:', errorText);
      return res.status(500).json({ 
        error: 'Claude API error', 
        details: errorText,
        status: response.status 
      });
    }

    const data = await response.json();
    console.log('Success! Response received');
    
    return res.json({ response: data.content[0].text });

  } catch (error) {
    console.log('Function error:', error.message);
    console.log('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}