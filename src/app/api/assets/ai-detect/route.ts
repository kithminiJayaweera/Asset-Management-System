import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

interface AIAssetInfo {
  manufacturer: string;
  model: string;
  category: string;
  estimatedPrice: number;
  description: string;
  specs?: Record<string, string>;
  usefulLife?: number;
  depreciationRate?: number;
}

// POST /api/assets/ai-detect - Use AI to detect asset information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length < 3) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Please provide a product name, model, or serial number' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    console.log('GROQ_API_KEY status:', apiKey ? 'Found (length: ' + apiKey.length + ')' : 'NOT FOUND');
    console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('GROQ')));
    
    if (!apiKey) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'AI detection is not configured. Please add GROQ_API_KEY to .env.local and restart the server.' },
        { status: 500 }
      );
    }

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Updated to current model
        messages: [
          {
            role: 'system',
            content: `You are an asset management specialist. Extract product information and return ONLY valid JSON with this exact structure:
{
  "manufacturer": "string",
  "model": "string",
  "category": "PC/Laptop" | "Office Furniture" | "Vehicle" | "Electronics" | "Machinery",
  "estimatedPrice": number (in USD),
  "description": "string (brief 1-2 sentence description)",
  "specs": {
    "brand": "manufacturer name",
    "model": "specific model number",
    "processor": "CPU details (for PC/Laptop)",
    "ram": "RAM size (for PC/Laptop)",
    "storage": "Storage capacity (for PC/Laptop)",
    "operatingSystem": "OS name (for PC/Laptop)",
    "material": "material type (for Office Furniture)",
    "color": "color (for Office Furniture)",
    "dimensions": "dimensions (for Office Furniture)",
    "weight": "weight (for Office Furniture)",
    "vehicleType": "type (for Vehicle)",
    "fuelType": "fuel type (for Vehicle)",
    "engineCapacity": "engine size (for Vehicle)",
    "powerRating": "power rating (for Electronics)",
    "voltage": "voltage (for Electronics)"
  },
  "usefulLife": number (in years),
  "depreciationRate": number (percentage per year)
}

Include ONLY relevant specs for the asset category. For example, PC/Laptop should have brand, model, processor, ram, storage, operatingSystem.
Return ONLY the JSON object, no markdown, no explanations.`
          },
          {
            role: 'user',
            content: `Extract asset information for: "${query}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('Groq API error:', errorData);
      console.error('Groq status:', groqResponse.status);
      console.error('Groq statusText:', groqResponse.statusText);
      
      // Better error messages based on status
      if (groqResponse.status === 401) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid Groq API key. Please check your key at console.groq.com' },
          { status: 500 }
        );
      }
      
      if (groqResponse.status === 429) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Groq API rate limit exceeded. Try again later.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Groq API error: ${errorData?.error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse AI response (remove markdown code blocks if present)
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }

    const assetInfo: AIAssetInfo = JSON.parse(cleanResponse);

    // Validate required fields
    if (!assetInfo.manufacturer || !assetInfo.model || !assetInfo.category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'AI could not extract complete product information' },
        { status: 422 }
      );
    }

    return NextResponse.json<ApiResponse<AIAssetInfo>>({
      success: true,
      data: assetInfo,
      message: 'Product information retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error in AI detection:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to detect asset information' },
      { status: 500 }
    );
  }
}
