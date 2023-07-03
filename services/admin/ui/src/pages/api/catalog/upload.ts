import formidable from "formidable";
import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

const parseJsonFromRequest = async (req: NextApiRequest) => {
  const form = new formidable.IncomingForm({
    maxFiles: 1,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      const parsedFiles = Object.values(files)[0];
      const file = Array.isArray(parsedFiles) ? parsedFiles[0] : parsedFiles;
      return JSON.parse(file.toString());
    });
  });
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string;
    } | null;
    error: string | null;
  }>
) => {
  return new Promise((resolve, reject) => {
    console.log(JSON.stringify(req.query));
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({
        data: null,
        error: "Method Not Allowed",
      });
      return;
    }
    // console.dir(req.body)

    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      console.log(JSON.parse(data));
      res.status(200).json({
        data: {
          url: "/uploaded-file-url",
        },
        error: null,
      });
      return resolve(void 0);
    });
  });
};

export default handler;
