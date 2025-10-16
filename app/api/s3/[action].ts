// pages/api/s3.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sql from 'mssql';
import stream from 'stream';
import { promisify } from 'util';
import { connectToDatabase } from '@/lib/db';

const pipeline = promisify(stream.pipeline);

// AWS Config
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET || '',
  },
});

// MSSQL Config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

interface FileDetails {
  bucketName: string;
  subDirectoryInBucket?: string;
  filename: string;
  userId: number;
  methodName: string;
}

// Helper to log info
async function logInfo(userId: number, details: string, procedureName: string, type: string) {
  const pool = await connectToDatabase();
  await pool.request()
    .input('UserId', sql.Int, userId)
    .input('Details', sql.NVarChar, details)
    .input('ProcedureName', sql.NVarChar, procedureName)
    .input('Type', sql.NVarChar, type)
    .input('TableName', sql.NVarChar, 'S3')
    .input('RecordId', sql.Int, userId)
    .execute('spLogInfo');
  pool.close();
}

// GET file from S3
async function getFile(fileDetails: FileDetails) {
  try {
    const key = fileDetails.subDirectoryInBucket
      ? `${fileDetails.subDirectoryInBucket}/${fileDetails.filename}`
      : fileDetails.filename;

    const command = new GetObjectCommand({
      Bucket: fileDetails.bucketName,
      Key: key,
    });

    const data = await s3Client.send(command);
    const chunks: Uint8Array[] = [];

    if (data.Body instanceof stream.Readable) {
      await pipeline(data.Body, new stream.Writable({
        write(chunk, _, callback) {
          chunks.push(chunk);
          callback();
        },
      }));
    }

    await logInfo(fileDetails.userId, 'File Downloaded Successfully', fileDetails.methodName, 'File Download');

    return {
      bytes: Buffer.concat(chunks),
      message: 'File Downloaded Successfully',
    };
  } catch (err: any) {
    return { bytes: null, message: err.message };
  }
}

// UPLOAD file to S3
async function uploadFile(file: any, fileDetails: FileDetails) {
  try {
    const key = fileDetails.subDirectoryInBucket
      ? `${fileDetails.subDirectoryInBucket}/${fileDetails.filename}`
      : fileDetails.filename;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: fileDetails.bucketName,
        Key: key,
        Body: file, // file is a Readable stream or Buffer
      },
    });

    await upload.done();
    await logInfo(fileDetails.userId, 'File Uploaded Successfully', fileDetails.methodName, 'File Upload');

    return { fileUploadStatus: true, message: 'File Uploaded Successfully' };
  } catch (err: any) {
    return { fileUploadStatus: false, message: err.message };
  }
}

// DELETE file from S3
async function deleteFile(filePath: string, fileDetails: FileDetails) {
  try {
    const key = fileDetails.subDirectoryInBucket
      ? `${fileDetails.subDirectoryInBucket}/${filePath}`
      : filePath;

    const command = new DeleteObjectCommand({
      Bucket: fileDetails.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    await logInfo(fileDetails.userId, 'File Deleted Successfully', fileDetails.methodName, 'File Deleted');

    return { fileUploadStatus: true, message: 'File Deleted Successfully' };
  } catch (err: any) {
    return { fileUploadStatus: false, message: err.message };
  }
}

// API Route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  try {
    if (req.method === 'POST') {
      const fileDetails: FileDetails = req.body.fileDetails;

      if (action === 'upload') {
        const file = Buffer.from(req.body.fileBase64, 'base64'); // send file as base64
        const result = await uploadFile(file, fileDetails);
        return res.status(200).json(result);
      } else if (action === 'delete') {
        const result = await deleteFile(req.body.filename, fileDetails);
        return res.status(200).json(result);
      } else if (action === 'download') {
        const result = await getFile(fileDetails);
        return res.status(200).json(result);
      } else {
        return res.status(400).json({ message: 'Invalid action' });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
