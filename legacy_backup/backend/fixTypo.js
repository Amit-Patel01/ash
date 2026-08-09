require('dotenv').config();
const { connectDB, closeDB } = require('./utils/mongo');

async function fixTypoInPlans() {
  console.log("Connecting to DB...");
  const db = await connectDB();
  const collection = db.collection('courses');
  
  const docs = await collection.find({}).toArray();
  let updatedCount = 0;

  for (const doc of docs) {
    let needsUpdate = false;
    
    if (doc.plans && Array.isArray(doc.plans)) {
      const updatedPlans = doc.plans.map(plan => {
        if (plan.features && Array.isArray(plan.features)) {
          let planNeedsUpdate = false;
          const newFeatures = plan.features.map(f => {
            if (typeof f === 'string' && f.includes('According Your Project and Skil')) {
              needsUpdate = true;
              planNeedsUpdate = true;
              return f.replace('According Your Project and Skil', 'According To Your Project and Skills');
            }
            return f;
          });
          if (planNeedsUpdate) {
            return { ...plan, features: newFeatures };
          }
        }
        return plan;
      });

      if (needsUpdate) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { plans: updatedPlans } }
        );
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} courses.`);
  await closeDB();
}

fixTypoInPlans().catch(err => console.error(err));
