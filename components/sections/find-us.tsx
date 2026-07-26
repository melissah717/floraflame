import { fetchStockists } from "@/lib/stockists";
import { FindUsClient } from "@/components/sections/find-us-client";

/**
 * Server component. Fetches the sheet on the server and passes plain data
 * down to the interactive client component.
 *
 * The split matters: the fetch needs to be server-side (so the sheet URL
 * stays out of the browser bundle and the response is cached across all
 * visitors), while search and geolocation need to be client-side. One
 * component can't be both.
 */
export async function FindUs() {
  const stockists = await fetchStockists();
  return <FindUsClient stockists={stockists} />;
}