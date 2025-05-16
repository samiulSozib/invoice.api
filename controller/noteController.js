const {sequelize}=require('../database/database')
const db=require('../database/database')


// get notes by user id
exports.getNotesByUserId=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
    const user_id=req.params.user_id
    try{
        const notes=await db.note.findAll({where:{user_id:user_id}},{
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', notes:notes })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',notes:[]})
    }
}

// Create Note
exports.createNote = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { user_id, title, details } = req.body;

    try {
        const note = await db.note.create(
            { user_id, title, details },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(201).json({ status: true, message: 'Note created successfully', note });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', note: null });
    }
};


// Edit Note
exports.editNote = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { note_id } = req.params; // Assuming the note ID is passed as a parameter
    const { title, details } = req.body;

    try {
        const note = await db.note.findOne({ where: { id: note_id } }, { transaction: transactionScope });

        if (!note) {
            return res.status(404).json({ status: false, message: 'Note not found' });
        }

        await note.update(
            { title, details },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Note updated successfully', note });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', note: null });
    }
};


// Delete Note
exports.deleteNote = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { note_id } = req.params; // Assuming the note ID is passed as a parameter

    try {
        const note = await db.note.findOne({ where: { id: note_id } }, { transaction: transactionScope });

        if (!note) {
            return res.status(404).json({ status: false, message: 'Note not found' });
        }

        await note.destroy({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Note deleted successfully' });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error' });
    }
};


// Get Note by ID
exports.getNoteById = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { note_id } = req.params; // Assuming the note ID is passed as a parameter

    try {
        const note = await db.note.findByPk(
            note_id,
            { transaction: transactionScope }
        );
        console.log(note)

        if (!note) {
            return res.status(404).json({ status: false, message: 'Note not found', note: null });
        }

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Note fetched successfully', note });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', note: null });
    }
};
