import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  isValid: boolean;
  isRelevant: boolean;
  isQualityOk: boolean;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Изображение не предоставлено' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const api_key = Deno.env.get('api_key');
    
    if (!api_key) {
      console.error('api_key not configured');
      // Fallback: accept all images if AI is not available
      return new Response(
        JSON.stringify({ isValid: true, isRelevant: true, isQualityOk: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare image for vision API - clean and validate base64
    let imageData = imageBase64;
    let mimeType = 'image/jpeg';
    
    // Extract mime type and clean base64 data
    if (imageBase64.includes('data:')) {
      const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        imageData = dataUrlMatch[2];
      } else if (imageBase64.includes('base64,')) {
        imageData = imageBase64.split('base64,')[1];
        const typeMatch = imageBase64.match(/data:([^;]+)/);
        if (typeMatch) mimeType = typeMatch[1];
      }
    }
    
    // Validate base64 - remove any whitespace/newlines
    imageData = imageData.replace(/[\s\n\r]/g, '');
    
    // Check if base64 is valid
    if (!imageData || imageData.length < 100) {
      console.error('Invalid base64 data: too short');
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          reason: 'Изображение повреждено или слишком маленькое. Загрузите другое фото.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Processing image, mimeType:', mimeType, 'dataLength:', imageData.length);

    const response = await fetch('https://api.gateway.local/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Ты строгий модератор изображений для экологического приложения SafeAir Pro.
Твоя задача - СТРОГО проверить фото на два критерия:

1. РЕЛЕВАНТНОСТЬ (ОЧЕНЬ ВАЖНО - будь строгим!):
   Фото ОБЯЗАТЕЛЬНО должно содержать элементы окружающей среды для анализа качества воздуха:
   ✅ ПОДХОДЯТ ТОЛЬКО:
   - Небо, облака, атмосфера, горизонт
   - Уличные сцены с видом на небо
   - Городской пейзаж с улицами и зданиями на фоне неба
   - Промышленные объекты, трубы, дым
   - Природные ландшафты (горы, леса, поля)
   - Транспорт на улице, дороги

   ❌ НЕ ПОДХОДЯТ (ОТКЛОНЯЙ!):
   - Портреты людей, селфи, лица
   - Еда, напитки
   - Документы, текст, скриншоты
   - Интерьеры помещений (комнаты, офисы)
   - Домашние животные крупным планом
   - Абстрактные изображения
   - Продукты, товары
   - Любые фото БЕЗ видимого неба или улицы

2. КАЧЕСТВО:
   - Не слишком размытое
   - Не слишком тёмное или засвеченное
   - Можно различить основные элементы

ВАЖНО: Если на фото человек крупным планом (селфи, портрет) - это НЕ подходит, даже если на заднем плане есть небо!

Ответь СТРОГО в JSON формате:
{
  "isRelevant": true/false,
  "isQualityOk": true/false,
  "reason": "краткое объяснение на русском почему фото не подходит, или null если подходит"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Проанализируй это изображение для AR-сканера качества воздуха:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageData}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI analysis failed:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Слишком много запросов. Попробуйте позже.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Fallback: reject image if AI fails (safer approach)
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isRelevant: false, 
          isQualityOk: true,
          reason: 'Не удалось проверить изображение. Попробуйте ещё раз.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', aiResponse);

    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const result: AnalysisResult = {
          isValid: (parsed.isRelevant === true) && (parsed.isQualityOk === true),
          isRelevant: parsed.isRelevant === true,
          isQualityOk: parsed.isQualityOk === true,
          reason: parsed.reason || undefined
        };
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
    }

    // Fallback if parsing fails - reject to be safe
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        isRelevant: false, 
        isQualityOk: true,
        reason: 'Не удалось распознать изображение. Попробуйте другое фото.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        isValid: false,
        reason: 'Ошибка анализа изображения. Попробуйте ещё раз.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
