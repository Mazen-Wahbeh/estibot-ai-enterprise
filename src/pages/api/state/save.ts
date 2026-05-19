import { withProtectedPost } from "@/api/http";
import { stateHandler } from "@/api/handlers/stateHandler";

export default withProtectedPost(stateHandler);
