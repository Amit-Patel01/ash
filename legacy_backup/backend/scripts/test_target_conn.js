const { MongoClient } = require("mongodb");

const connectionStrings = [
  "mongodb+srv://Amitsolution_db:djJVMdx8nzY6mcZB@Ashnexa Systems.t8phtbl.mongodb.net/solutionhub",
  "mongodb+srv://Amitsolution_db:djJVMdx8nzY6mcZB@Ashnexa Systems.t8phtbl.mongodb.net/solutionhub?retryWrites=true&w=majority",
  "mongodb+srv://Amitsolution_db:djJVMdx8nzY6mcZB@Ashnexa Systems.t8phtbl.mongodb.net/solutionhub?tls=true&tlsAllowInvalidCertificates=true",
  "mongodb+srv://Amitsolution_db:djJVMdx8nzY6mcZB@Ashnexa Systems.t8phtbl.mongodb.net/solutionhub?directConnection=false"
];

async function testConnections() {
  for (const uri of connectionStrings) {
    console.log("\nTesting:", uri.replace(/:[^:@]+@/, ":****@"));
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      const db = client.db("solutionhub");
      const cols = await db.listCollections().toArray();
      console.log("SUCCESS! Connected. Collections:", cols.length);
      await client.close();
      return;
    } catch (err) {
      console.error("FAILED:", err.message);
    }
  }
}

testConnections();
