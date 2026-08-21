const { PrismaClient } = require("../generated/prisma/index.js");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const validator = require("validator");
const adapter = new PrismaMariaDb({
  host: "127.0.0.1",
  user: "root",
  password: "mypassword",
  database: "Email_Password_Records",
  port: 3306,
  allowPublicKeyRetrieval: true,
  useSSL: false,
});

const prisma = new PrismaClient({ adapter });

const addNewRecord = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email || !validator.isEmail(email)) {
      return res.status(200).json({
        status: "error",
        message: "please provide valid username or email",
      });
    }
    const password = req.body.password;
    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "plese provide  pasword",
      });
    }
    console.log("dasdsa");

    const link = req.body.link;
    if (!link || !validator.isURL(link)) {
      return res.status(200).json({
        status: "error",
        message: "Please provide a valid URL starting with http:// or https://",
      });
    }
    console.log("dasdsa");

    const existinglink = await prisma.Records.findUnique({
      where: { Link: link },
    });
    if (existinglink) {
      const data = await prisma.Records.update({
        where: {
          Link: link,
        },
        data: {
          Email: email,
          Password: password,
        },
      });
      return res.status(200).json({
        data,
      });
    }

    const createnew = await prisma.Records.create({
      data: {
        Link: link,
        Email: email,
        Password: password,
      },
    });

    return res.status(200).json({
      status: "sucess",
      message: "successfully stroed email password",
      data: createnew,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const getalldata = async (req, res) => {
  try {
    const record = await prisma.Records.findMany();
    return res.status(200).json({
      data: record,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const getuniqueID = async (req, res) => {
  try {
    const id = req.body.id;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "please provide valid id",
      });
    }
    const rec = await prisma.Records.findUnique({
      where: {
        Id: id,
      },
    });
    return res.status(200).json({
      data: rec,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const DeleteRecord = async (req, res) => {
  try {
    const id = req.body.id;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "please provide id",
      });
    }
    const deleteIDs = await prisma.Records.delete({
      where: {
        Id: id,
      },
    });

    return res.status(200).json({
      stauts: "sucess deleted",
      data: deleteIDs,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const updateData = async (req, res) => {
  try {
    const link = req.body.link;
    const password = req.body.password;
    const email = req.body.email;
    const id = req.body.id;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "please provide id",
      });
    }

    let data = await prisma.Records.findUnique({
      where: {
        Id: id,
      },
    });

    if (!data) {
      return res.status(400).json({
        status: "error",
        message: "id not found",
      });
    }
    const value = {};
    let upemail, uppass, uplink;
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "please provide valid id",
      });
    } else if (email) {
      value.email = email;
    }

    if (link && validator.isURL(link, { require_protocol: true })) {
      return;
    }

    if (password) {
      uppass = await prisma.Records.update({
        where: {
          Id: id,
        },
        data: {
          Password: password,
        },
      });
    }
    data = await prisma.Records.findUnique({
      where: {
        Id: id,
      },
    });
    return res.status(200).json({
      statua: "sucess",
      message: "successfully updated",
      data: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "internal server error",
    });
  }
};

module.exports = {
  getalldata,
  getuniqueID,
  addNewRecord,
  DeleteRecord,
  updateData,
};
