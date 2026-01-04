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
      throw new Error('Ongeldige URL.')
    }

    console.log(`Processing URL: ${url}`)

    let html = ''
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
        }
      })
      if (pageResponse.ok) {
        html = await pageResponse.text()
      }
    } catch (e) { console.warn("Fetch failed", e) }

    let jsonLdData: any = {}
    try {
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const content = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '')
            const parsed = JSON.parse(content)
            const product = Array.isArray(parsed) 
              ? parsed.find(i => i['@type'] === 'Product') 
              : (parsed['@type'] === 'Product' ? parsed : null)
            
            if (product) {
              // Handle image as string or array
              let images = [];
              if (Array.isArray(product.image)) {
                images = product.image.filter(img => typeof img === 'string');
                // Se for array de objetos (ImageObject)
                if (images.length === 0 && product.image.length > 0) {
                    images = product.image.map((img: any) => img.url || img.contentUrl).filter(Boolean);
                }
              } else if (typeof product.image === 'string') {
                images = [product.image];
              } else if (typeof product.image === 'object' && product.image.url) {
                images = [product.image.url];
              }

              jsonLdData = {
                title: product.name,
                image: images[0] || '',
                gallery: images,
                description: product.description,
                price: product.offers?.price || product.offers?.[0]?.price || product.offers?.lowPrice,
              }
              break
            }
          } catch (e) { continue }
        }
      }
    } catch (e) { console.log('JSON-LD extraction error', e) }

    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`, 'i')) ||
                    html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`, 'i'))
      return match ? match[1] : null
    }

    const title = jsonLdData.title || getMeta('og:title') || 'Geïmporteerd Product'
    const image = jsonLdData.image || getMeta('og:image') || 'https://via.placeholder.com/800x800'
    // Se não achou galeria no JSON-LD, usa a imagem principal como galeria
    const gallery = jsonLdData.gallery && jsonLdData.gallery.length > 0 ? jsonLdData.gallery : [image];
    
    let price = 0
    if (jsonLdData.price) {
      price = parseFloat(jsonLdData.price)
    } else {
      const priceMatch = html.match(/[\$€£]\s*(\d+[.,]\d{2})/)
      price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 50
    }

    const basicData = {
      title: title.substring(0, 100),
      description: (jsonLdData.description || getMeta('og:description') || '').substring(0, 500),
      price: price || 50,
      category: 'Overig',
      image: image,
      gallery: gallery,
      condition: 'NEW'
    }

    return new Response(JSON.stringify(basicData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})