import { withProtectedPost } from "@/api/http";
import { resetHandler } from "@/api/handlers/resetHandler";

export default withProtectedPost(resetHandler);
