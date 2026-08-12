const express=require("express")
const router=express.Router();
const RecordController=require("../controllers/Record.controller");
router.post('/add',RecordController.addNewRecord);
router.get('/',RecordController.getalldata);
router.get('/',RecordController.getuniqueID)

module.exports=router;

