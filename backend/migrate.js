import mongoose from 'mongoose';

// Connection URIs
const localURI = 'mongodb://localhost:27017/climax-lights';
const atlasURI = 'mongodb+srv://Climaxlights:Happysoul123@cluster0.llkydae.mongodb.net/climax-lights?retryWrites=true&w=majority';

const migrate = async () => {
    try {
        console.log('🔌 Connecting to local MongoDB...');
        const localConnection = await mongoose.createConnection(localURI).asPromise();
        console.log('✅ Connected to local MongoDB.');

        console.log('🔌 Connecting to MongoDB Atlas (Cloud)...');
        const atlasConnection = await mongoose.createConnection(atlasURI).asPromise();
        console.log('✅ Connected to MongoDB Atlas.');

        // Get list of collections in local database
        const collections = await localConnection.db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections locally.`);

        for (const colInfo of collections) {
            const colName = colInfo.name;
            
            // Skip system collections or index collections
            if (colName.startsWith('system.')) continue;

            console.log(`\n⏳ Migrating collection: "${colName}"...`);
            
            const localCollection = localConnection.db.collection(colName);
            const atlasCollection = atlasConnection.db.collection(colName);

            // Fetch all documents from local collection
            const documents = await localCollection.find({}).toArray();
            console.log(`🔹 Found ${documents.length} documents in local "${colName}".`);

            if (documents.length === 0) {
                console.log(`⚠️ Collection "${colName}" is empty, skipping.`);
                continue;
            }

            // Clear destination collection on Atlas to avoid duplicates
            console.log(`🧹 Clearing existing documents in Atlas "${colName}"...`);
            await atlasCollection.deleteMany({});

            // Insert into Atlas
            console.log(`📤 Copying documents to Atlas "${colName}"...`);
            const insertResult = await atlasCollection.insertMany(documents);
            console.log(`🎉 Successfully migrated ${insertResult.insertedCount} documents to Atlas.`);
        }

        // Close connections
        await localConnection.close();
        await atlasConnection.close();
        console.log('\n🏁 Data migration completed successfully! All local database collections have been copied to the cloud.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
