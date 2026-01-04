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

    // 1. Fetch the HTML
    let html = ''
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        }
      })
      if (!pageResponse.ok) throw new Error('Kan pagina niet laden');
      html = await pageResponse.text()
    } catch (e) {
      throw new Error(`Fetch error: ${e.message}`)
    }

    let productData = {
      title: '',
      description: '',
      price: 0,
      image: '',
      gallery: [] as string[],
      category: 'Overig'
    };

    // 2. AI Extraction (If API Key is provided - PREFERRED)
    if (apiKey) {
      try {
        console.log('Using AI extraction...');
        // Strip scripts and styles to reduce token usage and noise
        const cleanText = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<[^>]+>/g, ' ') // Remove html tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .substring(0, 15000); // Limit context

        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "openai/gpt-3.5-turbo", // Cost effective fast model, or use a free one via OpenRouter
            "messages": [
              {
                "role": "system",
                "content": "You are a product scraper. Extract JSON data from the provided website text. Return ONLY raw JSON with keys: title (clean, no store names), price (number only), description (short summary), image (url), category (one of: Elektronica, Design, Fietsen, Vintage Mode, Kunst & Antiek, Gadgets)."
              },
              {
                "role": "user",
                "content": `Extract product info from this text: ${cleanText}`
              }
            ]
          })
        });

        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          const content = aiJson.choices[0]?.message?.content;
          // Try to parse the JSON from the AI response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            productData = { ...productData, ...parsed };
            // Ensure gallery has at least the main image
            if (productData.image) productData.gallery = [productData.image];
          }
        }
      } catch (aiError) {
        console.error("AI Extraction failed, falling back to manual", aiError);
      }
    }

    // 3. Manual Fallback (Regex/JSON-LD) - If AI failed or no key
    if (!productData.title || !productData.price) {
      console.log('Using manual scraping fallback...');
      
      // JSON-LD Extraction
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const content = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '')
            const parsed = JSON.parse(content)
            const product = Array.isArray(parsed) ? parsed.find(i => i['@type'] === 'Product') : (parsed['@type'] === 'Product' ? parsed : null)
            
            if (product) {
              productData.title = product.name;
              productData.description = product.description;
              // Handle Image
              if (Array.isArray(product.image)) {
                 productData.image = typeof product.image[0] === 'string' ? product.image[0] : product.image[0]?.url;
              } else if (typeof product.image === 'string') {
                 productData.image = product.image;
              } else if (product.image?.url) {
                 productData.image = product.image.url;
              }
              // Handle Price
              const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              if (offer) {
                productData.price = parseFloat(offer.price);
              }
              break;
            }
          } catch (e) { continue }
        }
      }

      // Meta Tags Fallback
      const getMeta = (prop: string) => {
        const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`, 'i')) ||
                      html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`, 'i'))
        return match ? match[1] : null
      }

      if (!productData.title) productData.title = getMeta('og:title') || '';
      if (!productData.image) productData.image = getMeta('og:image') || '';
      if (!productData.description) productData.description = getMeta('og:description') || '';
      
      // Price Regex fallback (last resort)
      if (!productData.price) {
        // Look for price meta
        const priceMeta = getMeta('product:price:amount');
        if (priceMeta) {
          productData.price = parseFloat(priceMeta);
        } else {
          // Regex for currency: € 1.200,00 or €1200.00
          const priceMatch = html.match(/[€$£]\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
          if (priceMatch) {
            // Normalize European format (1.200,00) to JS format (1200.00)
            let priceStr = priceMatch[1];
            if (priceStr.includes(',') && priceStr.includes('.')) {
               // Assuming . is thousand and , is decimal if comma is last
               if (priceStr.lastIndexOf(',') > priceStr.lastIndexOf('.')) {
                 priceStr = priceStr.replace(/\./g, '').replace(',', '.');
               }
            } else if (priceStr.includes(',')) {
               priceStr = priceStr.replace(',', '.');
            }
            productData.price = parseFloat(priceStr);
          }
        }
      }
    }

    // 4. CLEANUP & NORMALIZATION
    // Clean Title (Remove " | StoreName", " - Site", etc.)
    if (productData.title) {
      productData.title = productData.title.split('|')[0].split(' - ')[0].trim();
      // Decode HTML entities in title
      productData.title = productData.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    } else {
      productData.title = "Naamloos Product";
    }

    // Fallback Price
    if (!productData.price || isNaN(productData.price)) {
      productData.price = 50.00; // Safe fallback
    }

    // Ensure Image
    if (!productData.image) {
      productData.image = "https://via.placeholder.com/800x800?text=No+Image";
    }
    
    // Setup Gallery
    if (!productData.gallery || productData.gallery.length === 0) {
      productData.gallery = [productData.image];
    }

    console.log("Final Extracted Data:", productData);

    return new Response(JSON.stringify(productData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Clone error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})