const router=require('express').Router()
const {getNotesByUserId,createNote,editNote,deleteNote,getNoteById}=require('../controller/noteController')


router.get('/get-by-user-id/:user_id',getNotesByUserId)
router.post('/create', createNote); 
router.put('/edit/:note_id', editNote); 
router.delete('/delete/:note_id', deleteNote);
router.get('/get-by-note-id/:note_id', getNoteById);



module.exports=router