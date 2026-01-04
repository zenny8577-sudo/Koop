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
    
    if (!url || !url.startsWith('http')) {
      throw new Error('Ongeldige URL. Zorg ervoor dat de link begint met http:// of https://')
    }

    console.log(`Processing URL: ${url}`)

    // 1. Fetch com Headers de Navegador Real (Bypass básico de bot protection)
    let html = ''
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
          'Referer': 'https://www.google.com/'
        }
      })
      if (pageResponse.ok) {
        html = await pageResponse.text()
      } else {
        console.warn(`Fetch failed with status: ${pageResponse.status}`)
      }
    } catch (fetchError) {
      console.warn("Failed to fetch page content directly:", fetchError)
    }

    // 2. Extração Inteligente (JSON-LD + Meta Tags)
    // Tenta encontrar dados estruturados de Produto (Schema.org)
    let jsonLdData: any = {}
    try {
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const content = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '')
            const parsed = JSON.parse(content)
            // Procura por @type Product (pode ser um objeto ou array)
            const product = Array.isArray(parsed) 
              ? parsed.find(i => i['@type'] === 'Product') 
              : (parsed['@type'] === 'Product' ? parsed : null)
            
            if (product) {
              jsonLdData = {
                title: product.name,
                image: Array.isArray(product.image) ? product.image[0] : product.image,
                description: product.description,
                price: product.offers?.price || product.offers?.[0]?.price || product.offers?.lowPrice,
                currency: product.offers?.priceCurrency || product.offers?.[0]?.priceCurrency
              }
              break
            }
          } catch (e) { continue }
        }
      }
    } catch (e) { console.log('JSON-LD extraction error', e) }

    // Fallback para Meta Tags se JSON-LD falhar
    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`, 'i')) ||
                    html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`, 'i'))
      return match ? match[1] : null
    }

    const title = jsonLdData.title || getMeta('og:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || 'Geïmporteerd Product'
    const image = jsonLdData.image || getMeta('og:image') || getMeta('twitter:image') || 'https://via.placeholder.com/800x800?text=No+Image'
    const description = jsonLdData.description || getMeta('og:description') || getMeta('description') || `Geïmporteerd van: ${url}`
    
    // Preço: Tenta JSON-LD -> Regex no HTML
    let price = 0
    if (jsonLdData.price) {
      price = parseFloat(jsonLdData.price)
    } else {
      const priceMatch = html.match(/[\$€£]\s*(\d+[.,]\d{2})/) || html.match(/(\d+[.,]\d{2})\s*[\$€£]/)
      price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 50
    }

    const basicData = {
      title: title.substring(0, 100),
      description: description.substring(0, 500),
      price: price || 50,
      category: 'Overig',
      image: image,
      condition: 'NEW'
    }

    // 3. Decisão: Usar IA ou Retornar Dados Extraídos
    const openRouterKey = apiKey || Deno.env.get('OPENROUTER_API_KEY')

    // Se não tiver chave OU se já extraímos dados de alta qualidade via JSON-LD, podemos pular a IA se o html estiver vazio (erro de fetch)
    if (!openRouterKey || !html) {
      console.log("No API Key or empty HTML. Returning scraped data.")
      return new Response(JSON.stringify(basicData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Modo IA (Refinamento)
    // Se temos HTML, a IA pode limpar o título e categorizar melhor
    console.log("Enhancing with AI...")
    
    const cleanText = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .substring(0, 4000)

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
            
            Extract product details from the text.
            - title: Clean, commercial Dutch title.
            - description: Attractive Dutch description (max 300 chars).
            - price: Number only.
            - category: One of ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets', 'Vintage Mode'].
            - image: URL.
            
            Prioritize this structured data if available:
            ${JSON.stringify(basicData)}
            
            Page Text Context:
            ${cleanText}
            `
          }
        ]
      })
    });

    if (!aiResponse.ok) {
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

    content = content.replace(/```json/g, '').replace(/```/g, '').trim()
    const productData = JSON.parse(content)

    // Fallback de imagem
    if (!productData.image || productData.image.includes('placeholder') || productData.image.length < 10) {
        productData.image = basicData.image;
    }

    return new Response(JSON.stringify(productData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Clone Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, // Bad Request para erros de cliente
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})