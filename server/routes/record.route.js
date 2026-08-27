const express = require("express");
const router = express.Router();
const {
  addNewRecord,
  getalldata,
  getuniqueID,
  DeleteRecord,
  updateData,
  getSortedData
} = require("../controllers/Record.controller");

router.post("/add", addNewRecord);
router.get("/", getalldata);
router.get("/", getuniqueID);
router.get("/:sortBy/:orderBy", getSortedData);
router.delete("/del", DeleteRecord);
router.patch("/update", updateData);


module.exports = router;
