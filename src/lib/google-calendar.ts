type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

type GoogleCalendarEvent = {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status?: "confirmed" | "cancelled";
};

export function buildGoogleCalendarWebUrl(
  calendarId?: string | null,
): string {
  const normalized = calendarId?.trim();

  if (!normalized || normalized === "primary") {
    return "https://calendar.google.com/calendar/u/0/r";
  }

  return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(normalized)}`;
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function resolveGoogleRedirectUri() {
  const explicit = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (explicit) {
    return explicit;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (appUrl) {
    return `${appUrl}/api/google/oauth/callback`;
  }

  const netlifyUrl = process.env.URL?.trim().replace(/\/+$/, "");
  if (netlifyUrl) {
    return `${netlifyUrl}/api/google/oauth/callback`;
  }

  throw new Error(
    "Missing GOOGLE_REDIRECT_URI and NEXT_PUBLIC_APP_URL. Please configure one of them in environment variables.",
  );
}

export function buildGoogleOAuthUrl() {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const redirectUri = resolveGoogleRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ].join(" "),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForGoogleTokens(code: string) {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = resolveGoogleRedirectUri();

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token refresh failed: ${text}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function calendarFetch<T>(
  accessToken: string,
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Calendar API failed: ${text}`);
  }

  if (method === "DELETE") {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEvent,
) {
  return calendarFetch<{ id: string; htmlLink?: string }>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    "POST",
    event,
  );
}

export async function updateGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>,
) {
  return calendarFetch<{ id: string; htmlLink?: string }>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    "PATCH",
    event,
  );
}

export async function deleteGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
) {
  await calendarFetch<null>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    "DELETE",
  );
}
