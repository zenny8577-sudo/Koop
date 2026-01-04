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
      throw new Error('URL ongeldig.')
    }

    console.log(`Scraping URL: ${url}`)

    // Controller para cancelar o fetch se demorar mais de 6 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let html = '';
    let blocked = false;

    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (pageResponse.status === 403 || pageResponse.status === 401) {
        console.log("Site blocked the scraper.");
        blocked = true;
      } else if (!pageResponse.ok) {
        throw new Error(`HTTP ${pageResponse.status}`);
      } else {
        html = await pageResponse.text();
      }
    } catch (e) {
      console.log("Fetch failed or timed out:", e.message);
      blocked = true; // Treat timeout as blocked/fail to trigger fallback
    }

    // Estrutura padrão de retorno
    let productData = {
      title: '',
      description: '',
      price: 0,
      image: '',
      gallery: [] as string[],
      category: 'Overig',
      scraped_successfully: !blocked
    };

    // --- FALLBACK LOGIC ---
    // Se foi bloqueado (AliExpress/Amazon), tentamos extrair info da URL para não devolver vazio
    if (blocked || !html) {
      if (url.includes('aliexpress')) {
        productData.title = 'AliExpress Item (Details Protected)';
        productData.description = `Imported ID from URL: ${url}`;
        productData.image = 'https://ae01.alicdn.com/kf/S7a3b3799602a4666a466755609e992925.png'; // Placeholder Ali
      } else if (url.includes('amazon')) {
        productData.title = 'Amazon Product';
        productData.description = `Check Amazon link: ${url}`;
        productData.image = 'https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png';
      } else {
        productData.title = 'External Product';
      }
      
      // Retorna sucesso parcial para o usuário poder editar
      return new Response(JSON.stringify(productData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- PARSING NORMAL ---
    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']*)["']`, 'i'));
      return match ? match[1] : null;
    }

    productData.title = getMeta('og:title') || getMeta('twitter:title') || '';
    productData.image = getMeta('og:image') || getMeta('twitter:image') || '';
    productData.description = getMeta('og:description') || '';

    // Limpeza de Título
    if (productData.title) {
        // Remove sufixos comuns de SEO
        productData.title = productData.title.split('|')[0].split(' - ')[0].trim();
        productData.title = productData.title.replace(/&amp;/g, '&');
    } else {
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        if (titleMatch) productData.title = titleMatch[1].trim();
    }

    // Preço
    const priceMeta = getMeta('product:price:amount') || getMeta('price') || getMeta('og:price:amount');
    if (priceMeta) {
        const p = parseFloat(priceMeta.replace(',', '.'));
        if (!isNaN(p)) productData.price = p;
    }

    // Fallback Imagem
    if (!productData.image) {
       const imgMatch = html.match(/https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)/i);
       if (imgMatch) productData.image = imgMatch[0];
       else productData.image = "https://via.placeholder.com/800x800?text=No+Image";
    }

    productData.gallery = [productData.image];

    // Se tiver API Key e HTML válido, tenta melhorar com IA (opcional)
    if (apiKey && html.length > 500) {
       // ... lógica de IA existente ...
       // Mantemos simples por agora para garantir velocidade
    }

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