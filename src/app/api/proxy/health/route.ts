import { forward } from "../_forward";

export function GET() {
  return forward("/health");
}
