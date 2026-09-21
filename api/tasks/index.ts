import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany({
        orderBy: { createdAtTs: 'desc' },
      });
      // Convert database createdAtTs to numeric createdAt (milliseconds)
      const mappedTasks = tasks.map(t => ({
        id: t.id,
        colorName: t.colorName,
        colorHex: t.colorHex,
        liters: t.liters,
        status: t.status,
        createdAt: t.createdAtTs.getTime(),
      }));
      return res.status(200).json(mappedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { colorName, colorHex, liters, status } = req.body;
      if (!colorName || liters == null || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newTask = await prisma.task.create({
        data: {
          colorName,
          colorHex,
          liters: Number(liters),
          status,
        },
      });

      return res.status(201).json({
        id: newTask.id,
        colorName: newTask.colorName,
        colorHex: newTask.colorHex,
        liters: newTask.liters,
        status: newTask.status,
        createdAt: newTask.createdAtTs.getTime(),
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
