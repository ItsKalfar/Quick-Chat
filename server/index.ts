import dotenv from "dotenv";
import connectDB from "./db/index";
import { httpServer } from "./app";

dotenv.config({
  path: "./.env",
});

const nodeVersion = process.env.NODE_VERSION || "";
const versionMatch = /v(\d+)/.exec(nodeVersion);
const majorNodeVersion = versionMatch ? parseInt(versionMatch[1], 10) : 0;
console.log(majorNodeVersion);

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    console.log("Server is running on port: " + process.env.PORT);
  });
};

async function main() {
  if (majorNodeVersion >= 14) {
    try {
      await connectDB();
      startServer();
    } catch (err) {
      console.log("Mongo db connect error: ", err);
    }
  } else {
    connectDB()
      .then(() => {
        startServer();
      })
      .catch((err) => {
        console.log("Mongo db connect error: ", err);
      });
  }
}

main();
