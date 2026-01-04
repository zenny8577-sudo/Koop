import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    // Validate admin credentials
    if (email !== 'brenodiogo27@icloud.com') {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if user exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // If user doesn't exist in auth.users, create it
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirmed: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Breno',
        last_name: 'Diogo',
        role: 'ADMIN'
      }
    })

    if (authError && !authError.message.includes('already exists')) {
      throw authError
    }

    const userId = authData?.user?.id || existingUser?.id

    if (!userId) {
      throw new Error('Could not create or find user')
    }

    // Create or update profile in public.users with verified status
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: email,
        role: 'ADMIN',
        verification_status: 'verified',
        first_name: 'Breno',
        last_name: 'Diogo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      throw profileError
    }

    // Generate session token for immediate login
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.signInWithPassword({
      email: email,
      password: password
    })

    if (sessionError) throw sessionError

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: sessionData.user,
        session: sessionData.session
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auto-confirm error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})