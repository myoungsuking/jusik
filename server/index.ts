import cors from 'cors';
import express from 'express';
import { createMarketProvider } from './services/market/providers/index.js';
import { getMarketStatuses } from './services/market/status.js';
import { assertRangeInterval, chartQuerySchema, getAllowedIntervals, ranges, symbolSearchSchema } from './services/market/validation.js';

const app = express();
const provider = createMarketProvider();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/market/chart', async (req, res, next) => {
  try {
    const query = chartQuerySchema.parse(req.query);
    assertRangeInterval(query.range, query.interval);
    const candles = await provider.getChartData(query);
    res.json({ data: candles });
  } catch (error) {
    next(error);
  }
});

app.get('/api/market/quote/:symbol', async (req, res, next) => {
  try {
    const symbol = String(req.params.symbol).toUpperCase();
    const quote = await provider.getQuote(symbol);
    res.json({ data: quote });
  } catch (error) {
    next(error);
  }
});

app.get('/api/market/search', async (req, res, next) => {
  try {
    const query = symbolSearchSchema.parse(req.query);
    const results = await provider.searchSymbols(query.q);
    res.json({ data: results });
  } catch (error) {
    next(error);
  }
});

app.get('/api/market/status', (_req, res) => {
  res.json({ data: getMarketStatuses() });
});

app.get('/api/market/options', (_req, res) => {
  res.json({
    data: ranges.map((range) => ({
      range,
      intervals: getAllowedIntervals(range),
    })),
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  const status = message.includes('does not support') ? 400 : 500;
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Market API listening on http://localhost:${port}`);
});
