import { Response, NextFunction } from 'express';
import Note from '../models/Note.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import sendResponse from '../utils/sendResponse.js';
import { CustomError } from '../utils/customError.js';


export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, filter } = req.query;


    const query: any = {
      $or: [
        { owner: req.user },
        { collaborators: req.user }
      ]
    };

    if (search && typeof search === 'string') {
      query.title = { $regex: search, $options: 'i' };
    }

    if (filter && typeof filter === 'string' && filter !== 'all') {
      query.tag = filter;
    }

    const notes = await Note.find(query);
    sendResponse(res, 200, notes);
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
};

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content , tag , collaborators } = req.body;


    if (!title || !content) {
      return next(new CustomError('Title and content are required', 400));
    }
    const note = await Note.create({ title, content, tag, collaborators, owner: req.user });
    sendResponse(res, 201, note);
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
};

export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, tag , collaborators } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id },
      { title, content, tag, collaborators },
      { new: true }
    );

    console.log(note,"noteas")

    if (!note) {

      return next(new CustomError('Note not found', 404));
    }

    sendResponse(res, 200, note);
  } catch (error: any) {
  
    console.error(error);
    return next(new CustomError(error.message, 500));
  }
};

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, owner: req.user });

    if (!note) {
      return next(new CustomError('Note not found', 404));
    }

    sendResponse(res, 200, { message: 'Note deleted' });
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
};

export const getNoteById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
   const note = await Note.findOne({
  _id: id,
  $or: [
    { owner: req.user }, 
    { collaborators: { $in: [req.user] } }
  ]
});

    if (!note) {
      return next(new CustomError('Note not found', 404));
    }

    sendResponse(res, 200, note);
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
}
