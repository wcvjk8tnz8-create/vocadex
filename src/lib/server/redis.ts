import net from "node:net";
import tls from "node:tls";

/**
 * A tiny Redis client built on node:net / node:tls.
 *
 * Railway (and most hosts) expose Redis as a single `REDIS_URL`, e.g.
 *   redis://default:<password>@<host>.railway.internal:6379
 *   rediss://default:<password>@<public-host>:6379      (TLS)
 *
 * Vocadex only needs GET / SET / DEL on one key, so this speaks just enough of
 * the RESP protocol to do that — no npm package, nothing to install, and it
 * works on any Node host (Railway, Render, Fly, a school server, …).
 */

type Options = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls: boolean;
  db?: number;
};

function parse(url?: string | null): Options | null {
  const raw = String(url ?? "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const scheme = u.protocol.replace(/:$/, "").toLowerCase();
    if (!["redis", "rediss", "redis+tls", "rediss+tls"].includes(scheme)) return null;
    const db = u.pathname && u.pathname !== "/" ? Number(u.pathname.slice(1)) : undefined;
    return {
      host: u.hostname,
      port: Number(u.port || 6379),
      username: u.username ? decodeURIComponent(u.username) : undefined,
      password: u.password ? decodeURIComponent(u.password) : undefined,
      tls: scheme.startsWith("rediss") || scheme.includes("tls"),
      db: Number.isFinite(db) ? db : undefined,
    };
  } catch {
    return null;
  }
}

export function redisOptions(): Options | null {
  return (
    parse(process.env.REDIS_URL) ||
    parse(process.env.REDIS_PRIVATE_URL) ||
    parse(process.env.REDIS_PUBLIC_URL) ||
    parse(process.env.REDIS_TLS_URL) ||
    null
  );
}

/** Encodes one command as a RESP array of bulk strings. */
function encode(args: string[]): Buffer {
  const parts: Buffer[] = [Buffer.from(`*${args.length}\r\n`)];
  for (const a of args) {
    const b = Buffer.from(a, "utf8");
    parts.push(Buffer.from(`$${b.length}\r\n`), b, Buffer.from("\r\n"));
  }
  return Buffer.concat(parts);
}

type Reply = { kind: "ok" | "nil" | "bulk" | "int" | "err"; value: string };

/** Reads complete replies off the socket until `count` have arrived. */
function readReplies(socket: net.Socket, count: number): Promise<Reply[]> {
  return new Promise((resolve, reject) => {
    let buf = Buffer.alloc(0);
    const out: Reply[] = [];
    let pending: { len: number } | null = null;

    const onData = (chunk: Buffer) => {
      buf = Buffer.concat([buf, chunk]);
      try {
        for (;;) {
          if (pending) {
            if (buf.length < pending.len + 2) return;
            const body = buf.subarray(0, pending.len);
            buf = buf.subarray(pending.len + 2);
            pending = null;
            out.push({ kind: "bulk", value: body.toString("utf8") });
            continue;
          }
          const idx = buf.indexOf("\r\n");
          if (idx < 0) return;
          const line = buf.subarray(0, idx).toString("utf8");
          buf = buf.subarray(idx + 2);
          const tag = line[0];
          const rest = line.slice(1);
          if (tag === "+") out.push({ kind: "ok", value: rest });
          else if (tag === "-") out.push({ kind: "err", value: rest });
          else if (tag === ":") out.push({ kind: "int", value: rest });
          else if (tag === "$") {
            const len = Number(rest);
            if (len < 0) out.push({ kind: "nil", value: "" });
            else pending = { len };
          } else if (tag === "*") {
            /* array header — not used by GET/SET/DEL, ignore */
          }
          if (out.length >= count) {
            socket.off("data", onData);
            resolve(out);
            return;
          }
        }
      } catch (e) {
        socket.off("data", onData);
        reject(e instanceof Error ? e : new Error("Bad Redis reply"));
      }
    };

    socket.on("data", onData);
    socket.once("error", reject);
  });
}

function connect(opts: Options): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = opts.tls
      ? tls.connect({ host: opts.host, port: opts.port, servername: opts.host })
      : net.connect({ host: opts.host, port: opts.port });
    socket.setNoDelay(true);
    socket.setTimeout(8000);
    const done = (err?: Error) => {
      socket.removeListener("connect", ok);
      socket.removeListener("error", bad);
      socket.removeListener("secureConnect", ok);
      if (err) reject(err);
      else resolve(socket);
    };
    const ok = () => done();
    const bad = (e: Error) => done(e instanceof Error ? e : new Error(String(e)));
    socket.once("connect", ok);
    socket.once("secureConnect", ok);
    socket.once("error", bad);
  });
}

/** Runs one command (optionally after AUTH/SELECT) and closes the socket. */
async function command(args: string[]): Promise<Reply> {
  const opts = redisOptions();
  if (!opts) throw new Error("Redis is not configured");
  const socket = await connect(opts);
  try {
    const prelude: string[] = [];
    if (opts.password) {
      prelude.push(...(opts.username ? ["AUTH", opts.username, opts.password] : ["AUTH", opts.password]));
    }
    if (opts.db) prelude.push("SELECT", String(opts.db));
    const writes: Buffer[] = [];
    if (prelude.length) writes.push(encode(prelude));
    writes.push(encode(args));
    socket.write(Buffer.concat(writes));
    const replies = await readReplies(socket, (prelude.length ? 1 : 0) + 1);
    const last = replies[replies.length - 1];
    if (last.kind === "err") throw new Error(last.value);
    return last;
  } finally {
    socket.destroy();
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const reply = await command(["GET", key]);
  return reply.kind === "bulk" ? reply.value : null;
}

export async function redisSet(key: string, value: string): Promise<void> {
  await command(["SET", key, value]);
}

export async function redisDel(key: string): Promise<void> {
  await command(["DEL", key]);
}

/** Used by /api/health so you can see at a glance whether storage is wired up. */
export async function redisPing(): Promise<boolean> {
  const reply = await command(["PING"]);
  return reply.kind === "ok" || reply.kind === "bulk";
}
