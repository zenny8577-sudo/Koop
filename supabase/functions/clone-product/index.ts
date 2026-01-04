import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')

    if (!openRouterKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in Supabase Secrets.')
    }

    if (!url) {
      throw new Error('URL is required.')
    }

    console.log(`Cloning product from: ${url}`)

    // Chamada para a IA (OpenRouter)
    // Usando o modelo gratuito do Google (Gemini 2.0 Flash) que é excelente para extração
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
          {
            "role": "system",
            "content": `You are a professional product extraction API. 
            Your goal is to extract or infer product details from a given URL string.
            Analyze the URL structure, keywords, and potential product IDs.
            
            Return a JSON object with the following fields:
            - title: A clean, commercial product title (in Dutch if possible, otherwise English).
            - description: A professional sales description (in Dutch).
            - price: An estimated number (numeric only, no currency symbols).
            - category: One of ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets', 'Mode'].
            - image: A plausible image URL for this type of product (use a high-quality placeholder from unsplash if you cannot extract the real one).
            
            Return ONLY raw JSON. No markdown formatting.`
          },
          {
            "role": "user",
            "content": `Analyze this product URL: ${url}`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter Error:", err);
      throw new Error('Failed to connect to AI Service');
    }

    const aiData = await response.json()
    let content = aiData.choices[0].message.content

    // Limpeza básica caso a IA retorne markdown
    content = content.replace(/```json/g, '').replace(/```/g, '').trim()
    
    const productData = JSON.parse(content)

    return new Response(JSON.stringify(productData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Clone Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})