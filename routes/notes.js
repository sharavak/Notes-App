const express = require('express');
const router=express.Router();
const middleware=require('../middleware');

const notes=require('../controller/notes')
router.route('/show').get(middleware.isLoggedIn,notes.renderShowNotes);
router.route('/new').get(middleware.isLoggedIn,notes.renderNewNote).post(middleware.isLoggedIn,notes.createNote);
router.route('/:id').get(middleware.isLoggedIn,notes.renderEditNote).put(middleware.isLoggedIn,notes.editNote).delete(middleware.isLoggedIn,notes.deleteNote);
module.exports = router;