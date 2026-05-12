const express = require('express');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// POST /upload/file
// Headers: Content-Type (file mime type), X-Filename (original filename)
// Body: raw file bytes (up to 50 MB)
// Returns: { fileKey, publicUrl }
router.post('/file',
  express.raw({ type: '*/*', limit: '50mb' }),
  async (req, res) => {
    const originalName = req.headers['x-filename'] || 'upload.bin';
    const contentType  = req.headers['content-type'] || 'application/octet-stream';
    const ext = originalName.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const fileKey = `uploads/${uuidv4()}.${ext}`;

    console.log(`[upload] ${originalName} — ${contentType} — ${req.body?.length ?? 0} bytes — key: ${fileKey}`);
    try {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
        ContentType: contentType,
        Body: req.body,
        Metadata: { originalName },
      }));

      const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;
      console.log(`[upload] success: ${publicUrl}`);
      res.json({ fileKey, publicUrl });
    } catch (err) {
      console.error('[upload] R2 error:', err?.message || err);
      console.error('[upload] R2 error detail:', JSON.stringify(err));
      res.status(500).json({ error: 'Upload failed', detail: err?.message });
    }
  }
);

// Internal helper used by webhook — fetch file bytes from R2
async function fetchFileFromR2(fileKey) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
  });
  const response = await r2.send(cmd);
  const chunks = [];
  for await (const chunk of response.Body) chunks.push(chunk);
  return {
    buffer: Buffer.concat(chunks),
    contentType: response.ContentType || 'application/octet-stream',
    originalName: response.Metadata?.originalname || fileKey.split('/').pop(),
  };
}

module.exports = router;
module.exports.fetchFileFromR2 = fetchFileFromR2;
