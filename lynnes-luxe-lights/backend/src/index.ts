import Fastify from "fastify";
import cors from "@fastify/cors";
import { getOrCreateWallet } from "./wallet";
import { spin } from "./game";
import { getMissions, incrementSpinMission } from "./missions";
import { redeemPromo } from "./promo";

const app = Fastify();
app.register(cors, { origin: true });

const USER_ID = "demo-user"; // no auth for now

app.get("/api/wallet", async () => {
  return getOrCreateWallet(USER_ID);
});

app.post("/api/spin", async (_req, reply) => {
  try {
    const result = spin(USER_ID, "vegas_dreams");
    const mission = incrementSpinMission(USER_ID);
    return { result, mission };
  } catch (e: any) {
    if (e.message === "INSUFFICIENT_FUNDS") {
      reply.code(400);
      return { error: "INSUFFICIENT_FUNDS" };
    }
    reply.code(500);
    return { error: "UNKNOWN" };
  }
});

app.get("/api/missions", async () => {
  return getMissions(USER_ID);
});

app.post("/api/promo/redeem", async (req, reply) => {
  const body = req.body as { code?: string };
  if (!body.code) {
    reply.code(400);
    return { error: "MISSING_CODE" };
  }
  try {
    const grant = redeemPromo(USER_ID, body.code);
    const wallet = getOrCreateWallet(USER_ID);
    return { grant, wallet };
  } catch (e: any) {
    reply.code(400);
    return { error: e.message };
  }
});

app.listen({ port: 4000, host: "0.0.0.0" }).then(() => {
  console.log("API running on http://localhost:4000");
});
