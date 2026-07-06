import axios from 'axios';
import { Profile } from 'passport-facebook';

type FacebookJson = {
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  picture?: { data?: { url?: string } };
};

export interface ResolvedFacebookProfile {
  providerId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

function readEmailFromProfile(profile: Profile): string | undefined {
  const direct = profile.emails?.[0]?.value?.trim();
  if (direct) return direct;

  const json = (profile._json ?? {}) as FacebookJson;
  if (typeof json.email === 'string' && json.email.trim()) {
    return json.email.trim();
  }

  return undefined;
}

async function fetchFacebookEmailFromGraph(accessToken: string): Promise<string | undefined> {
  try {
    const { data } = await axios.get<{ email?: string }>('https://graph.facebook.com/me', {
      params: { fields: 'email', access_token: accessToken },
    });
    return typeof data.email === 'string' && data.email.trim() ? data.email.trim() : undefined;
  } catch {
    return undefined;
  }
}

function readAvatarUrl(profile: Profile): string | undefined {
  const photo = profile.photos?.[0]?.value?.trim();
  if (photo) return photo;

  const json = (profile._json ?? {}) as FacebookJson;
  return json.picture?.data?.url?.trim() || undefined;
}

function readNameParts(profile: Profile): { firstName: string; lastName: string } {
  const json = (profile._json ?? {}) as FacebookJson;

  const firstName =
    profile.name?.givenName?.trim() ||
    json.first_name?.trim() ||
    profile.displayName?.split(' ')[0]?.trim() ||
    'User';

  const lastName =
    profile.name?.familyName?.trim() ||
    json.last_name?.trim() ||
    profile.displayName?.split(' ').slice(1).join(' ').trim() ||
    '';

  return { firstName, lastName };
}

export async function resolveFacebookProfile(
  profile: Profile,
  accessToken: string,
): Promise<ResolvedFacebookProfile> {
  let email = readEmailFromProfile(profile);

  if (!email && accessToken) {
    email = await fetchFacebookEmailFromGraph(accessToken);
  }

  const { firstName, lastName } = readNameParts(profile);

  return {
    providerId: profile.id,
    email: email ?? null,
    firstName,
    lastName,
    avatarUrl: readAvatarUrl(profile),
  };
}
