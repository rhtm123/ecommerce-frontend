import { PUBLIC_ESTORE_ID, PUBLIC_API_URL } from "$env/static/public";
import { myFetch } from "$lib/utils/myFetch";

export async function GET() {
  // Fetch from your DB or external API

  let url = `${PUBLIC_API_URL}/estore/theme/${PUBLIC_ESTORE_ID}`;
  console.log(url);
  let data = await myFetch(url);
  // console.log(data);
  const theme = data.variables;

  return new Response(JSON.stringify(theme), {
    headers: { "Content-Type": "application/json" }
  });
}
