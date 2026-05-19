import { withProtectedPost } from "@/api/http";
import { calculateHandler } from "@/api/handlers/calculateHandler";

export default withProtectedPost(calculateHandler);
