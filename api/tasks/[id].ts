import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid task ID is required' });
  }

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json({
        id: updatedTask.id,
        colorName: updatedTask.colorName,
        colorHex: updatedTask.colorHex,
        liters: updatedTask.liters,
        status: updatedTask.status,
        createdAt: updatedTask.createdAtTs.getTime(),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.task.delete({
        where: { id },
      });
      return res.status(204).end();
    } catch (error) {
      console.error('Failed to delete task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
