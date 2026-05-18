import { withPost } from "@/api/http";
import { calculateHandler } from "@/api/handlers/calculateHandler";

export default withPost(calculateHandler);
