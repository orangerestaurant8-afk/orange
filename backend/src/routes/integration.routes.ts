import { Router } from 'express';
import { z } from 'zod';
import { parsePosEvent, processIncomingPosEvent, verifyPosRequest } from '../services/pos-integration.service';

export const posIntegrationRouter = Router();
posIntegrationRouter.post('/pos/events', async (req, res, next) => {
  try {
    if (!verifyPosRequest(req)) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized integration request' } });
    const event = parsePosEvent(JSON.parse(req.body.toString('utf8')));
    if (req.header('x-integration-event-id') !== event.eventId || req.header('x-integration-event-type') !== event.type) return res.status(400).json({ error: { code: 'INVALID_EVENT', message: 'Integration headers do not match event envelope' } });
    const result = await processIncomingPosEvent(event); return res.status(200).json({ data: { result } });
  } catch (error) {
    if (error instanceof SyntaxError) return res.status(400).json({ error: { code: 'INVALID_EVENT', message: 'Invalid integration event payload' } });
    next(error);
  }
});
