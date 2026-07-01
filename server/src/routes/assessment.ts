import { Router } from 'express';
import { getOrCreateCandidateKey } from '../services/candidateKey';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const assessmentRouter = Router();

assessmentRouter.get(
  '/key',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, getOrCreateCandidateKey());
  }),
);
