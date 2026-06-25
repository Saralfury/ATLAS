import { forward } from "../_forward";

export function POST(request: Request) {
  return forward("/simulate", request);
}
