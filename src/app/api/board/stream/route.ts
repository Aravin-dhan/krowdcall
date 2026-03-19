import { buildPublicMarketSnapshots, splitBoardMarkets } from "@/lib/data";
import { createJsonEvent, sseHeaders } from "@/lib/sse";

export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const pushSnapshot = async () => {
        if (closed) {
          return;
        }

        const markets = await buildPublicMarketSnapshots();
        controller.enqueue(
          createJsonEvent("snapshot", {
            markets,
            ...splitBoardMarkets(markets)
          })
        );
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
