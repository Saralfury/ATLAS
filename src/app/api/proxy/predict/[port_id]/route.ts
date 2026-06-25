import { forward } from "../../_forward";

export function GET(_: Request, context: { params: { port_id: string } }) {
  return forward(`/predict/${context.params.port_id}`);
}
