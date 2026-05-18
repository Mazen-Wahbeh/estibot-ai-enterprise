import { withPost } from "@/api/http";
import { resetHandler } from "@/api/handlers/resetHandler";

export default withPost(resetHandler);
