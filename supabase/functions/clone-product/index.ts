import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, apiKey } = await req.json()
    
    if (!url) {
      throw new Error('URL is verplicht.')
    }

    console.log(`Processing URL: ${url}`)

    // 1. Fetch the actual page content (Basic Scraping)
    // Usamos um User-Agent comum para evitar bloqueios simples
    let html = ''
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      if (pageResponse.ok) {
        html = await pageResponse.text()
      }
    } catch (fetchError) {
      console.warn("Failed to fetch page content directly:", fetchError)
      // Se falhar o fetch, ainda tentamos prosseguir se tivermos IA, ou falhamos se for modo básico
    }

    // 2. Extração Básica (Regex para Meta Tags)
    // Isso serve como fallback ou como base para a IA
    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`, 'i')) ||
                    html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`, 'i'))
      return match ? match[1] : null
    }

    const title = getMeta('og:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
    const image = getMeta('og:image') || ''
    const description = getMeta('og:description') || getMeta('description') || ''
    
    // Tenta achar preço via regex simples (procura padrões como € 100, $99.99)
    const priceMatch = html.match(/[\$€£]\s*(\d+[.,]\d{2})/) || html.match(/(\d+[.,]\d{2})\s*[\$€£]/)
    const rawPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0

    const basicData = {
      title: title.substring(0, 100), // Limite de segurança
      description: description.substring(0, 500) || `Geïmporteerd van: ${url}`,
      price: rawPrice || 50, // Preço padrão se não achar
      category: 'Overig',
      image: image || 'https://via.placeholder.com/800x800?text=No+Image',
      condition: 'NEW'
    }

    // 3. Decisão: Usar IA ou Retornar Básico
    const openRouterKey = apiKey || Deno.env.get('OPENROUTER_API_KEY')

    if (!openRouterKey) {
      console.log("No API Key found. Returning basic scraping results.")
      return new Response(JSON.stringify(basicData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Modo IA (Melhoria dos dados básicos)
    console.log("Enhancing with AI...")
    
    // Limpar HTML para enviar apenas texto relevante para a IA (economiza tokens)
    const cleanText = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .substring(0, 3000) // Primeiros 3000 caracteres costumam ter o info principal

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
            "content": `You are a product data extractor. Output ONLY JSON.
            
            Extract product details from the provided text/metadata.
            Map to these fields:
            - title: Dutch commercial title.
            - description: Dutch sales description (max 300 chars).
            - price: Number only.
            - category: One of ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets', 'Vintage Mode'].
            - image: The best image URL found or from metadata.
            
            Input Metadata:
            Title: ${basicData.title}
            Image: ${basicData.image}
            Price Found: ${basicData.price}
            
            Page Text Sample:
            ${cleanText}
            `
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      console.error("AI Error, falling back to basic data")
      return new Response(JSON.stringify(basicData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiData = await aiResponse.json()
    let content = aiData.choices?.[0]?.message?.content

    if (!content) {
       return new Response(JSON.stringify(basicData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Limpeza do JSON
    content = content.replace(/```json/g, '').replace(/```/g, '').trim()
    const productData = JSON.parse(content)

    // Fallback para imagem se a IA não achar uma melhor, usa a do scrape básico
    if (!productData.image || productData.image.includes('placeholder')) {
        productData.image = basicData.image;
    }

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