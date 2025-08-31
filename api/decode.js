export default async function handler(req, res) {
  console.log('Function started');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phrase, context } = req.body;
    console.log('Received:', phrase, context);

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('No API key found');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('API key found, making request...');

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
        messages: [{
          role: 'user',
          content: `What does "${phrase}" really mean when said by a ${context.replace('-', ' ')}? Keep it concise, 2-3 sentences.`
        }]
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API error:', errorText);
      return res.status(500).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    console.log('Success!');
    
    return res.json({ response: data.content[0].text });

  } catch (error) {
    console.error('Function error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}