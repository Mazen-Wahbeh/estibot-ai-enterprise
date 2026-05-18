import { withPost } from "@/api/http";
import { stateHandler } from "@/api/handlers/stateHandler";

export default withPost(stateHandler);
