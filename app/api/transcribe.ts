// pages/api/transcribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ReadStream } from 'fs';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm({ uploadDir: './', keepExtensions: true });

  form.parse(req, async (err: Error | null, fields: any, files: any) => {
    if (err) return res.status(500).json({ error: 'Error parsing file' });

    const file = files.file[0];
    const fileBuffer = await fs.promises.readFile(file.filepath);

    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]));
    formData.append('model', 'whisper-1');

    const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: formData as any,
    });

    const data = await openaiRes.json();
    res.status(200).json({ text: data.text });
  });
}
