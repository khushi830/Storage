const { PrismaClient } = require("../generated/prisma/index.js");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const validator = require("validator");

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  allowPublicKeyRetrieval: true,
  useSSL: false,
});

const prisma = new PrismaClient({ adapter });

const addNewRecord = async (req, res) => {
  try {
    const password = req.body.password;

    const link = req.body.link;
    if (!link || !validator.isURL(link)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid URL starting with http:// or https://",
      });
    }

    const email = req.body.email;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "please provide valid username or email",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "please provide  pasword",
      });
    }

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
    console.log(err).message;
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
    const ID = req.body.id;

    if (!ID) {
      return res.status(200).json({
        status: "error",
        message: "please provide  ID",
      });
    }

    const existingId = await prisma.Records.findUnique({
      where: {
        Id: ID,
      },
    });

    if (!existingId) {
      return res.status(200).json({
        status: "error",
        message: "please provide  valid ID",
      });
    }

    const { Link, Email, Password } = existingId;
    const prev = {
      Link: Link,
      Email: Email,
      Password: Password,
    };

    console.log(prev);
    const data = {};

    data.Password = password;

    // 2. Email check and validation
    if (prev.Email !== email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          // Changed to 400 bad request
          status: "error",
          message: "please provide valid email",
        });
      }
    }
    data.Email = email;

    // 3. Link check and validation
    if (prev.Link !== link) {
      if (!validator.isURL(link, { require_protocol: true })) {
        return res.status(400).json({
          // Changed to 400 bad request
          status: "error",
          message: "please provide valid link",
        });
      }
    }
    data.Link = link;

    const uppass = await prisma.Records.update({
      where: {
        Id: ID,
      },
      data: data,
    });
    return res.status(200).json({
      statua: "sucess",
      message: "successfully updated",
      data: uppass,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getSortedData = async (req, res) => {
  try {
    const sortBy = req.params.sortBy;
    const orderBy = req.params.orderBy;

    const fieldMap = {
      email: "Email",
      link: "Link",
      password: "Password",
      id: "Id"
    };

    if (!fieldMap[sortBy]) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sortBy parameter"
      });
    }

    const sortDirection = orderBy === "desc" ? "desc" : "asc";

    const data = await prisma.Records.findMany({
      orderBy: {
        [fieldMap[sortBy]]: sortDirection
      }
    });

    return res.status(200).json({
      status: "success",
      data: data
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

module.exports = {
  getalldata,
  getuniqueID,
  addNewRecord,
  DeleteRecord,
  updateData,
  getSortedData
};
