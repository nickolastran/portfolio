// Run: node --env-file=.env.local src/app/api/spotify/route.test.mjs
// Proves the three env vars actually mint a token and reach the player API.
import assert from "node:assert";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh_token } = process.env;
assert.ok(id && secret && refresh_token, "missing SPOTIFY_* env vars");

const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token }),
}).then((r) => r.json());

assert.ok(token.access_token, `no access_token: ${JSON.stringify(token)}`);

const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token.access_token}` },
});
assert.ok([200, 204].includes(res.status), `player API returned ${res.status}`);

console.log(
    res.status === 204
        ? "ok — auth works, nothing playing right now"
        : `ok — now playing: ${(await res.json()).item?.name}`,
);
