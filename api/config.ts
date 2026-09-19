import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const entries = await prisma.configuration.findMany();
      const config: Record<string, unknown> = {};
      for (const entry of entries) {
        config[entry.key] = JSON.parse(entry.value);
      }
      return res.status(200).json(config);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'key is required' });
      const entry = await prisma.configuration.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
      return res.status(200).json({ key: entry.key, value: JSON.parse(entry.value) });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to save configuration' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
