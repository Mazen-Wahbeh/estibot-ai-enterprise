import { withProtectedPost } from "@/api/http";
import { chatHandler } from "@/api/handlers/chatHandler";

export default withProtectedPost(chatHandler);
