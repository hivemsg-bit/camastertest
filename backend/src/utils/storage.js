import { getStorageBucket } from '../config/firebase.js';

export async function uploadBufferToStorage({ buffer, destinationPath, contentType, metadata = {} }) {
  const bucket = getStorageBucket();
  const file = bucket.file(destinationPath);
  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      contentType,
      metadata,
    },
    public: false,
    validation: 'crc32c',
  });
  return file;
}

export async function generateV4ReadSignedUrl(destinationPath, expiresInSeconds = 300) {
  const bucket = getStorageBucket();
  const file = bucket.file(destinationPath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    version: 'v4',
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}

export async function deleteFromStorage(destinationPath) {
  const bucket = getStorageBucket();
  const file = bucket.file(destinationPath);
  await file.delete({ ignoreNotFound: true });
}

