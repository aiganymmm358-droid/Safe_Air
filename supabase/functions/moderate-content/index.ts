import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  content: string;
  postId?: string;
  action: 'check' | 'report';
  reportReason?: string;
}

interface ModerationResult {
  isAppropriate: boolean;
  isRelevant: boolean;
  reason?: string;
  actionTaken?: string;
  banUntil?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Check if user is banned
    const { data: banData } = await supabase.rpc('is_user_banned', { _user_id: userId });
    if (banData === true) {
      return new Response(
        JSON.stringify({ error: 'Вы заблокированы. Публикация контента недоступна.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content, postId, action, reportReason }: ModerationRequest = await req.json();

    if (action === 'check') {
      // Use AI to check content relevance and appropriateness
      const moderationResult = await checkContentWithAI(content);
      
      if (!moderationResult.isAppropriate || !moderationResult.isRelevant) {
        // Issue warning/ban for inappropriate content
        const { data: modAction } = await supabase.rpc('moderate_user', {
          _user_id: userId,
          _reason: moderationResult.reason || 'Неприемлемый контент',
          _post_id: postId || null
        });

        const actionResult = modAction?.[0];
        
        return new Response(
          JSON.stringify({
            approved: false,
            reason: moderationResult.reason,
            actionTaken: actionResult?.action_taken,
            banUntil: actionResult?.ban_until
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ approved: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'report' && postId) {
      // Get post info
      const { data: post } = await supabase
        .from('community_posts')
        .select('user_id, content')
        .eq('id', postId)
        .single();

      if (!post) {
        return new Response(
          JSON.stringify({ error: 'Пост не найден' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check the reported content with AI
      const moderationResult = await checkContentWithAI(post.content);

      // Create report
      await supabase.from('content_reports').insert({
        post_id: postId,
        reporter_id: userId,
        reason: reportReason || 'Неприемлемый контент',
        status: 'pending'
      });

      if (!moderationResult.isAppropriate || !moderationResult.isRelevant) {
        // Auto-moderate if AI confirms violation
        const { data: modAction } = await supabase.rpc('moderate_user', {
          _user_id: post.user_id,
          _reason: moderationResult.reason || reportReason || 'Неприемлемый контент',
          _post_id: postId
        });

        const actionResult = modAction?.[0];

        return new Response(
          JSON.stringify({
            reported: true,
            autoModerated: true,
            actionTaken: actionResult?.action_taken,
            message: actionResult?.action_taken === 'ban' 
              ? 'Пользователь заблокирован на неделю' 
              : 'Пользователю вынесено предупреждение'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          reported: true, 
          autoModerated: false,
          message: 'Жалоба отправлена на рассмотрение модераторам'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkContentWithAI(content: string): Promise<ModerationResult> {
  const api_key = Deno.env.get('api_key');
  
  if (!api_key) {
    console.error('api_key not configured');
    // Fallback: approve content if AI is not available
    return { isAppropriate: true, isRelevant: true };
  }

  try {
    const response = await fetch('https://api.gateway.local/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `Ты модератор экологического сообщества SafeAir Pro. Твоя задача - проверять контент на:
1. РЕЛЕВАНТНОСТЬ: контент должен быть связан с экологией, качеством воздуха, природой, окружающей средой, здоровьем, устойчивым развитием, эко-активизмом
2. ПРИЕМЛЕМОСТЬ: контент не должен содержать оскорблений, ненависти, спама, рекламы, политической агитации, непристойностей

Ответь строго в JSON формате:
{
  "isRelevant": true/false,
  "isAppropriate": true/false,
  "reason": "причина отклонения на русском, если контент не прошел проверку, иначе null"
}`
          },
          {
            role: 'user',
            content: `Проверь этот контент:\n\n"${content}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      console.error('AI moderation failed:', await response.text());
      return { isAppropriate: true, isRelevant: true };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isRelevant: parsed.isRelevant ?? true,
        isAppropriate: parsed.isAppropriate ?? true,
        reason: parsed.reason || undefined
      };
    }

    return { isAppropriate: true, isRelevant: true };
  } catch (error) {
    console.error('AI moderation error:', error);
    return { isAppropriate: true, isRelevant: true };
  }
}
