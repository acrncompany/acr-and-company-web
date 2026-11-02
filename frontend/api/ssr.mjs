// Vercel serverless function that runs the Angular SSR server (src/server.ts) for every page request.
// A STATIC import (not import()) so Vercel traces dist/server and its node_modules into the function.
// `npm run build` must have produced dist/server first (vercel.json buildCommand does that).
import { reqHandler } from '../dist/server/server.mjs';

export default reqHandler;
