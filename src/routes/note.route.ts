import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createNote, getNotes, updateNote, deleteNote, getNoteById } from '../controllers/note.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { noteSchema } from '../validations/note.validations.js';
import { getAllUsers, getUserById } from '../controllers/auth.controller.js';

const router = Router();

router.use(authMiddleware);

//user
router.get("/get/users", getAllUsers);
router.get("/get/user/:id", getUserById);

// notes
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/create', validate(noteSchema), createNote);
router.put('/update/:id', validate(noteSchema), updateNote);
router.delete('/delete/:id', deleteNote);

export default router;
