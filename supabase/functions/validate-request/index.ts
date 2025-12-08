import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface ValidationError {
  field: string;
  message: string;
}

function validateNatureUpRequest(payload: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== 'object') {
    errors.push({ field: 'root', message: 'Payload must be an object' });
    return { valid: false, errors };
  }

  if (!payload.user || typeof payload.user !== 'object') {
    errors.push({ field: 'user', message: 'User object is required' });
  } else {
    if (!payload.user.id || typeof payload.user.id !== 'string') {
      errors.push({ field: 'user.id', message: 'User ID is required and must be a string' });
    }

    if (payload.user.healthGoals !== undefined) {
      if (!Array.isArray(payload.user.healthGoals)) {
        errors.push({ field: 'user.healthGoals', message: 'Health goals must be an array' });
      } else if (!payload.user.healthGoals.every((goal: any) => typeof goal === 'string')) {
        errors.push({ field: 'user.healthGoals', message: 'All health goals must be strings' });
      }
    }

    if (payload.user.preferences !== undefined && typeof payload.user.preferences !== 'object') {
      errors.push({ field: 'user.preferences', message: 'Preferences must be an object' });
    }
  }

  if (!payload.input || typeof payload.input !== 'object') {
    errors.push({ field: 'input', message: 'Input object is required' });
  } else {
    if (!payload.input.modality || !['voice', 'text'].includes(payload.input.modality)) {
      errors.push({ field: 'input.modality', message: 'Modality is required and must be "voice" or "text"' });
    }

    if (!payload.input.transcript || typeof payload.input.transcript !== 'string') {
      errors.push({ field: 'input.transcript', message: 'Transcript is required and must be a string' });
    }

    if (payload.input.language !== undefined && typeof payload.input.language !== 'string') {
      errors.push({ field: 'input.language', message: 'Language must be a string' });
    }
  }

  if (!payload.context || typeof payload.context !== 'object') {
    errors.push({ field: 'context', message: 'Context object is required' });
  } else {
    if (!payload.context.screen || typeof payload.context.screen !== 'string') {
      errors.push({ field: 'context.screen', message: 'Context screen is required and must be a string' });
    }

    if (payload.context.excursionId !== undefined && typeof payload.context.excursionId !== 'string') {
      errors.push({ field: 'context.excursionId', message: 'Excursion ID must be a string' });
    }

    if (payload.context.location !== undefined) {
      if (typeof payload.context.location !== 'object') {
        errors.push({ field: 'context.location', message: 'Location must be an object' });
      } else {
        if (typeof payload.context.location.lat !== 'number') {
          errors.push({ field: 'context.location.lat', message: 'Location latitude must be a number' });
        }
        if (typeof payload.context.location.lng !== 'number') {
          errors.push({ field: 'context.location.lng', message: 'Location longitude must be a number' });
        }
        if (payload.context.location.accuracyMeters !== undefined && typeof payload.context.location.accuracyMeters !== 'number') {
          errors.push({ field: 'context.location.accuracyMeters', message: 'Accuracy meters must be a number' });
        }
      }
    }

    if (payload.context.weatherSummary !== undefined) {
      if (typeof payload.context.weatherSummary !== 'object') {
        errors.push({ field: 'context.weatherSummary', message: 'Weather summary must be an object' });
      } else {
        if (typeof payload.context.weatherSummary.temperature !== 'number') {
          errors.push({ field: 'context.weatherSummary.temperature', message: 'Weather temperature must be a number' });
        }
        if (typeof payload.context.weatherSummary.condition !== 'string') {
          errors.push({ field: 'context.weatherSummary.condition', message: 'Weather condition must be a string' });
        }
      }
    }
  }

  if (!payload.capabilities || typeof payload.capabilities !== 'object') {
    errors.push({ field: 'capabilities', message: 'Capabilities object is required' });
  } else {
    if (typeof payload.capabilities.canUseLocation !== 'boolean') {
      errors.push({ field: 'capabilities.canUseLocation', message: 'canUseLocation must be a boolean' });
    }
    if (typeof payload.capabilities.canUseBackgroundAudio !== 'boolean') {
      errors.push({ field: 'capabilities.canUseBackgroundAudio', message: 'canUseBackgroundAudio must be a boolean' });
    }
  }

  if (!payload.clientVersion || typeof payload.clientVersion !== 'string') {
    errors.push({ field: 'clientVersion', message: 'Client version is required and must be a string' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const payload = await req.json();

    console.log('=== VALIDATION REQUEST RECEIVED ===');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const validation = validateNatureUpRequest(payload);

    if (validation.valid) {
      console.log('=== VALIDATION PASSED ===');
      return new Response(
        JSON.stringify({
          valid: true,
          message: 'Request payload is valid',
          receivedPayload: payload
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.log('=== VALIDATION FAILED ===');
      console.log('Errors:', validation.errors);
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Request payload is invalid',
          errors: validation.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in validate-request function:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: 'Failed to parse request',
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
