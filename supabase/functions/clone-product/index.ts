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
    
    if (!url || !url.startsWith('http')) throw new Error('Invalid URL');

    // Timeout rápido de 4s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let html = '';
    let blocked = false;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Status ' + response.status);
      html = await response.text();
    } catch (e) {
      console.log("Fetch failed:", e);
      blocked = true;
    }

    let data = {
      title: '',
      description: '',
      price: 0,
      image: '',
      gallery: [] as string[],
      category: 'Overig',
      scraped_successfully: !blocked
    };

    if (!blocked && html) {
      const getMeta = (p: string) => html.match(new RegExp(`<meta\\s+(?:property|name)=["']${p}["']\\s+content=["']([^"']*)["']`, 'i'))?.[1] || '';
      
      data.title = getMeta('og:title') || getMeta('twitter:title') || '';
      data.image = getMeta('og:image') || getMeta('twitter:image') || '';
      data.description = getMeta('og:description') || '';
      
      const priceMeta = getMeta('product:price:amount') || getMeta('price');
      if (priceMeta) data.price = parseFloat(priceMeta.replace(',', '.')) || 0;
    }

    // Fallbacks
    if (!data.title) data.title = "Geïmporteerd Item (Site Beveiligd)";
    if (!data.image) data.image = "https://via.placeholder.com/800?text=Upload";
    data.gallery = [data.image];

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    // Mesmo com erro fatal, retorna JSON válido para não quebrar o frontend
    return new Response(JSON.stringify({ 
      title: "Handmatige Import", 
      price: 0, 
      scraped_successfully: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})