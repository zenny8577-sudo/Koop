import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, email, message } = await req.json()

    // Configuration
    const TARGET_EMAIL = 'brenodiogo27@icloud.com';
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    console.log(`New contact message from ${name} (${email}): ${message}`);

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Koop Contact <onboarding@resend.dev>',
          to: TARGET_EMAIL,
          subject: `Nieuw Bericht van ${name}`,
          html: `
            <h1>Nieuw contactformulier bericht</h1>
            <p><strong>Naam:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Bericht:</strong></p>
            <p>${message}</p>
            <hr />
            <p>Bekijk dit bericht in het <a href="https://koop-marketplace.vercel.app/admin">Admin Dashboard</a>.</p>
          `,
        }),
      })

      if (!res.ok) {
        const error = await res.text();
        console.error('Resend API Error:', error);
        // We don't throw here to avoid breaking the client flow, as data is already in DB
      } else {
        console.log('Email sent successfully via Resend');
      }
    } else {
      console.log('RESEND_API_KEY not set. Email skipped, but saved to DB.');
    }

    return new Response(
      JSON.stringify({ success: true, message: "Message received" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing contact message:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})