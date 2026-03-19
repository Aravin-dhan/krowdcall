import { buildPublicMarketActivity } from "@/lib/data";
import { createJsonEvent, sseHeaders } from "@/lib/sse";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const pushSnapshot = async () => {
        if (closed) {
          return;
        }

        const activity = await buildPublicMarketActivity(slug);

        if (!activity) {
          controller.enqueue(createJsonEvent("not-found", { slug }));
          return;
        }

        controller.enqueue(createJsonEvent("snapshot", activity));
      };

      await pushSnapshot();

      const interval = setInterval(pushSnapshot, 5000);
      const abort = () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(interval);
        controller.close();
      };

      request.signal.addEventListener("abort", abort);
    }
  });

  return new Response(stream, {
    headers: sseHeaders
  });
}
