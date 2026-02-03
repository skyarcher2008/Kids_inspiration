export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const familyId = url.searchParams.get('familyId')

    if (!familyId) {
      return new Response('Missing familyId', {
        status: 400,
        headers: corsHeaders,
      })
    }

    // GET: 获取数据
    if (request.method === 'GET') {
      const result = await env.DB.prepare(
        'SELECT data FROM families WHERE family_id = ?'
      )
        .bind(familyId)
        .first()
      if (!result) {
        return new Response(JSON.stringify({ data: null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ data: JSON.parse(result.data) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST: 保存数据
    if (request.method === 'POST') {
      const body = await request.json()
      const timestamp = Date.now()
      await env.DB.prepare(
        'INSERT INTO families (family_id, data, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(family_id) DO UPDATE SET data = ?2, updated_at = ?3'
      )
        .bind(familyId, JSON.stringify(body), timestamp)
        .run()

      return new Response(JSON.stringify({ success: true, timestamp }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  },
}
