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
      throw new Error('Ongeldige URL. Zorg ervoor dat deze begint met http:// of https://')
    }

    console.log(`Processing URL: ${url}`)

    // 1. Fetch the HTML with robust headers to avoid blocking
    let html = ''
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      })
      if (!pageResponse.ok) throw new Error(`HTTP error! status: ${pageResponse.status}`);
      html = await pageResponse.text()
    } catch (e) {
      throw new Error(`Kan pagina niet openen: ${e.message}`)
    }

    let productData = {
      title: '',
      description: '',
      price: 0,
      image: '',
      gallery: [] as string[],
      category: 'Overig'
    };

    // Helper to find meta tags regex
    const getMeta = (prop: string) => {
      // Matches <meta property="og:title" content="..."> or <meta name="..." ...>
      // Handles both single and double quotes
      const match = html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']*)["']`, 'i'))
      return match ? match[1] : null
    }

    // 2. OpenGraph / Meta Data Extraction (Reliable Baseline)
    productData.title = getMeta('og:title') || getMeta('twitter:title') || '';
    productData.image = getMeta('og:image') || getMeta('twitter:image') || '';
    productData.description = getMeta('og:description') || getMeta('twitter:description') || '';
    
    // Clean title (remove site name often found after | or -)
    if (productData.title) {
        productData.title = productData.title.split('|')[0].split(' - ')[0].trim();
        // Decode common HTML entities
        productData.title = productData.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    }

    // Try to find price in metas
    const priceMeta = getMeta('product:price:amount') || getMeta('price') || getMeta('og:price:amount');
    if (priceMeta) {
        const p = parseFloat(priceMeta.replace(',', '.'));
        if (!isNaN(p)) productData.price = p;
    }

    // 3. AI Enhancement (Optional but preferred for details)
    if (apiKey) {
      try {
        // Strip heavy tags to save tokens
        const cleanText = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .substring(0, 12000); // 12k chars context limit

        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "openai/gpt-3.5-turbo",
            "messages": [
              {
                "role": "system",
                "content": "Extract JSON product data. Keys: title, price (number), description, category (Elektronica, Design, Fietsen, Vintage Mode, Kunst & Antiek, Gadgets). If not found, use reasonable defaults."
              },
              {
                "role": "user",
                "content": `Extract from: ${cleanText}`
              }
            ]
          })
        });

        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          const content = aiJson.choices?.[0]?.message?.content;
          if (content) {
             const jsonMatch = content.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
               const parsed = JSON.parse(jsonMatch[0]);
               // Only override if AI found something better/valid
               if (parsed.title && parsed.title.length > productData.title.length) productData.title = parsed.title;
               if (parsed.price && typeof parsed.price === 'number') productData.price = parsed.price;
               if (parsed.description) productData.description = parsed.description;
               if (parsed.category) productData.category = parsed.category;
             }
          }
        }
      } catch (e) {
        console.warn("AI extraction skipped:", e);
      }
    }

    // 4. Fallback for Title
    if (!productData.title) {
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        if (titleMatch) productData.title = titleMatch[1].trim();
        else productData.title = "Geïmporteerd Item";
    }

    // 5. Fallback for Image
    if (!productData.image) {
       // Try to find first generic jpg/png in html
       const imgMatch = html.match(/https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)/i);
       if (imgMatch) productData.image = imgMatch[0];
       else productData.image = "https://via.placeholder.com/800x800?text=No+Image";
    }

    // 6. Ensure Gallery
    productData.gallery = [productData.image];

    // 7. Ensure Price
    if (!productData.price) productData.price = 0;

    return new Response(JSON.stringify(productData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})