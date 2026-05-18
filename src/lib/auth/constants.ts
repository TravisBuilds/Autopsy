export const USER_COOKIE = "autopsy_user";
export const WHOOP_STATE_COOKIE = "autopsy_whoop_state";
export const WHOOP_ACCESS_COOKIE = "autopsy_whoop_access";
export const WHOOP_REFRESH_COOKIE = "autopsy_whoop_refresh";
export const WHOOP_EXPIRES_COOKIE = "autopsy_whoop_expires";

export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

/** Scopes for recovery, sleep, cycles — adjust in WHOOP developer portal */
export const WHOOP_SCOPES = [
  "offline",
  "read:profile",
  "read:recovery",
  "read:sleep",
  "read:cycles",
].join(" ");
