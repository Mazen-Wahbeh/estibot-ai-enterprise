import { withProtectedPost } from "@/api/http";
import { pdfHandler } from "@/api/handlers/pdfHandler";

export default withProtectedPost(pdfHandler);
