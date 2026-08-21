const express = require("express");
const router = express.Router();
const {
  addNewRecord,
  getalldata,
  getuniqueID,
  DeleteRecord,
  updateData,
} = require("../controllers/Record.controller");

router.post("/add", addNewRecord);
router.get("/", getalldata);
router.get("/", getuniqueID);
router.delete("/del", DeleteRecord);
router.patch("/update", updateData);

module.exports = router;
