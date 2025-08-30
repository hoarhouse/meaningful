export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phrase, context } = req.body;
  
  // Debug logging
  console.log('Function called with:', { phrase, context });
  console.log('API key present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API key starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 15));

  const prompt = `What does "${phrase}" really mean when said by a ${context.replace('-', ' ')}? 

Please provide:
1. The likely hidden meaning or subtext
2. The emotional motivation behind saying this
3. What they might actually want or need

Keep the response concise but insightful, around 2-3 sentences total.`;

  try {
    console.log('Making request to Claude API...');
    
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

    console.log('Claude API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Claude API error:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Success! Returning response');
    res.json({ response: data.content[0].text });
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
  }
}