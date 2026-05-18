import { withPost } from "@/api/http";
import { chatHandler } from "@/api/handlers/chatHandler";

export default withPost(chatHandler);
