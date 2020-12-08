import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import HttpStatusCode from 'http-status-codes';
import { getSounds as getSoundsDao, uploadSound as uploadSoundDao, deleteSound as deleteSoundDao } from '../dao/soundsDao';

export const getSounds = async (req: Request, res: Response): Promise<Response> => {
  try {
    const sounds  = await getSoundsDao();

    return res.status(HttpStatusCode.OK).json(sounds);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};

export const uploadSound = async (req: Request, res: Response): Promise<Response> => {
  try {
    const file = req.files?.file as UploadedFile;
    if (!file) {
      throw new Error('File was not provided.');
    }
    const sounds = await uploadSoundDao(file.name, file.data);
    return res.status(HttpStatusCode.OK).json(sounds);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};


export const deleteSound = async (req: Request, res: Response): Promise<Response> => {
  try {
    const key = req.body.key;
    const sounds = await deleteSoundDao(key);
    return res.status(HttpStatusCode.OK).json(sounds);
  } catch (e) {
    const err: Error = e as Error;

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: err.message, error: { message: err.message, stack: err.stack } });
  }
};
