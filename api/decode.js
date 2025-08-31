export default async function handler(req, res) {
  return res.json({ 
    message: "Function is working!",
    method: req.method,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    body: req.body
  });
}