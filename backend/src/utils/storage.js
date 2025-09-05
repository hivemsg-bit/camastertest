import admin from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const bucket = admin.storage().bucket();

export const uploadBuffer = async ({ buffer, destinationPath, contentType }) => {
  const file = bucket.file(destinationPath);
  const uuid = uuidv4();
  await file.save(buffer, {
    contentType,
    metadata: {
      metadata: { firebaseStorageDownloadTokens: uuid },
    },
    resumable: false,
    public: false,
  });
  return { path: destinationPath };
};

export const getSignedUrl = async ({ storagePath, expiresInSeconds = 60 }) => {
  const file = bucket.file(storagePath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
};

export const deleteFile = async ({ storagePath }) => {
  const file = bucket.file(storagePath);
  await file.delete({ ignoreNotFound: true });
};

