const {
    SPOTIFY_CLIENT_ID: id,
    SPOTIFY_CLIENT_SECRET: secret,
    SPOTIFY_REFRESH_TOKEN: refresh_token,
} = process.env;

const NOT_PLAYING = { isPlaying: false };

export async function GET() {
    if (!id || !secret || !refresh_token) return Response.json(NOT_PLAYING);

    const { access_token } = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ grant_type: "refresh_token", refresh_token }),
            cache: "no-store",
        },
    ).then((r) => r.json());
    if (!access_token) return Response.json(NOT_PLAYING);

    // 204 = nothing playing, 200 = a track (or a podcast episode, hence the ?.)
    const res = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${access_token}` }, cache: "no-store" },
    );
    if (res.status !== 200) return Response.json(NOT_PLAYING);

    const { is_playing, item } = await res.json();
    if (!item) return Response.json(NOT_PLAYING);

    return Response.json({
        isPlaying: is_playing,
        title: item.name,
        artist:
            item.artists?.map((a: { name: string }) => a.name).join(", ") ??
            item.show?.name ??
            "",
        art: (item.album ?? item.show)?.images?.[0]?.url ?? null,
        url: item.external_urls?.spotify ?? null,
    });
}
