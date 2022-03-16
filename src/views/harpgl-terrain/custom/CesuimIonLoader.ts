export const defaultToken =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MmIxYWJmNy0yZDA1LTRiYmQtYmI3Ny1iMGIwNTk5NWQyMWYiLCJpZCI6Mjk5MjQsImlhdCI6MTU5OTIwMDkxOX0.aUw9ehdKoobH0GEq5lp3s3Uk9_QSMZVvFFrsLsAACqc";
export function getCesiumIonUrl(assetId: number, accessToken: string) {
	const url = new URL(`https://api.cesium.com/v1/assets/${assetId}/endpoint`);
	url.searchParams.append("access_token", accessToken);
	return fetch(url.href, { mode: "cors" })
		.then((res) => res.json())
		.then((json) => {
			return { url: json.url, bearerToken: `Bearer ${json.accessToken}`, v: "", extensions: "" };
		});
}
export interface CesiumWorldTerrain {
	url: string;
	bearerToken: string;
	v: string;
	extensions: string;
}
export async function getCesiumWorldTerrain() {
	let res = await getCesiumIonUrl(1, defaultToken);
	res.v = "1.2.0";
	res.extensions = "octvertexnormals-metadata";
	return res;
}

// tiles = new TilesRenderer(url);
// tiles.fetchOptions.headers = {};
// tiles.fetchOptions.headers.Authorization = `Bearer ${json.accessToken}`;

// // Prefilter each model fetch by setting the cesium Ion version to the search
// // parameters of the url.
// tiles.onPreprocessURL = (uri) => {
//     uri = new URL(uri);
//     uri.searchParams.append("v", version);
//     return uri;
// };
