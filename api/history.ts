import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const history = await prisma.vacuumHistory.findMany({
        orderBy: {
          createdAtTs: 'desc',
        },
      });
      const mapped = history.map(item => ({
        ...item,
        color: item.colorName ? { name: item.colorName, hex: item.colorHex } : null
      }));
      return res.status(200).json(mapped);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      const entry = await prisma.vacuumHistory.create({
        data: {
          date: data.date,
          createdAt: data.createdAt,
          startTime: data.startTime,
          endTime: data.endTime,
          durationMinutes: data.durationMinutes,
          actualSeconds: data.actualSeconds,
          volumeLiters: data.volumeLiters,
          colorName: data.color?.name || null,
          colorHex: data.color?.hex || null,
          status: data.status,
        },
      });
      return res.status(201).json(entry);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create history entry' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
