export const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*", // domaine précis en prod
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
  