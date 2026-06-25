import { forward } from "../../_forward";

export function GET(request: Request) {
  const url = new URL(request.url);
  return forward(`/history/list${url.search}`);
}
