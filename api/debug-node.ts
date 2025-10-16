import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse): void {
    res.status(200).json({
        node: process.version,
        execArgv: process.execArgv,
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? null,
    });
}
