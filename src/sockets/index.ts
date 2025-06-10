import { Server } from 'socket.io';
import Note from '../models/Note.js';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a note room
    socket.on('join-note', (noteId) => {
      socket.join(noteId);
      console.log(`User ${socket.id} joined note: ${noteId}`);
      
      // Optionally notify other users someone joined
      socket.to(noteId).emit('user-joined', { 
        userId: socket.id, 
        noteId 
      });
    });

    // Leave a note room
    socket.on('leave-note', (noteId) => {
      socket.leave(noteId);
      console.log(`User ${socket.id} left note: ${noteId}`);
      
      // Optionally notify other users someone left
      socket.to(noteId).emit('user-left', { 
        userId: socket.id, 
        noteId 
      });
    });

    // Handle note editing
    socket.on('edit-note', async ({ noteId, content, title, tag }) => {
      try {
        // Save to database first
        await Note.findByIdAndUpdate(noteId, { content, title, tag });
        
        // Then broadcast to all other users in the note room
        socket.to(noteId).emit('note-updated', { 
          content,
          title,
          tag,
          // updatedBy: socket.id,
          // timestamp: new Date().toISOString()
        });
        
        // Confirm save to the sender
        socket.emit('note-saved', { 
          noteId, 
          success: true,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error saving note:', error);
        
        // Notify sender of save failure
        socket.emit('note-save-error', { 
          noteId, 
          error: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
        });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Socket.io automatically removes user from all rooms on disconnect
    });
  });
};