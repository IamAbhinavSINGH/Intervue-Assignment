import { Request, Response } from 'express';
import db from '../db';

/**
 * POST /api/room/:code/question
 * body: { token, question: string, options: [{ text, isCorrect? }], timeLimit? }
 */

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { question, options, timeLimit } = req.body as {
      question: string;
      options: { text: string; isCorrect?: boolean }[];
      timeLimit?: number;
    };

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Invalid payload: question and at least 2 options required' });
    }

    const room = await db.room.findUnique({ where: { code } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const created = await db.question.create({
      data: {
        text: question,
        roomId: room.id,
        timeLimit: timeLimit ?? 60,
        options: {
          create: options.map((o) => ({ text: o.text, isCorrect: !!o.isCorrect })),
        },
      },
      include: {
        options: true,
      },
    });

    return res.status(201).json({ question: created });
  } catch (err) {
    console.error('createQuestion error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPollHistory = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const room = await db.room.findUnique({ where: { code } });
    console.log("history api called : " , code);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const questions = await db.question.findMany({
      where: { roomId: room.id },
      include: { options: true },
      orderBy: { createdAt: 'asc' }, 
    });

    const result = [];

    for (const q of questions) {
      const total = await db.response.count({
        where: { id : q.id },
      });

      // for each option compute count and percent
      const optionsWithPercents = await Promise.all(
        q.options.map(async (opt: any) => {
          const count = await db.response.count({
            where: { id: q.id, optionId: opt.id },
          });
          const percent = total === 0 ? 0 : Math.round((count / total) * 100);
          return {
            id: opt.id,
            text: opt.text,
            percent,
          };
        })
      );

      result.push({
        id: q.id,
        text: q.text,
        options: optionsWithPercents,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error('getPollHistory error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};