import { withPost } from "@/api/http";
import { pdfHandler } from "@/api/handlers/pdfHandler";

export default withPost(pdfHandler);
