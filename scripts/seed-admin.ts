import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({ path: '.env.admin' });

async function seedAdmin() {
    // Create DataSource connection - using minimal config with direct SQL
    const dataSource = new DataSource({
        type: 'mariadb',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || process.env.DB_DATABASE || 'matchcreators_db',
        entities: [], // Empty entities array - we'll use raw SQL
        synchronize: false,
        logging: false,
    });

    try {
        console.log('🔄 Connecting to database...');
        await dataSource.initialize();
        console.log('✅ Database connected successfully!\n');

        // Check if admin already exists
        const existingAdmin = await dataSource.query(
            `SELECT * FROM \`admin\` WHERE \`email\` = 'my-admin@yopmail.com' AND \`isDeleted\` = 0`
        );

        if (existingAdmin.length > 0) {
            console.log(`⚠️  Warning: Admin with email 'my-admin@yopmail.com' already exists.`);
            console.log('   Skipping seed to avoid duplicates.\n');
            await dataSource.destroy();
            return;
        }

        console.log('👤 Creating admin user...');

        // Hash password
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin using raw SQL
        await dataSource.query(`
      INSERT INTO \`admin\` (
        \`firstName\`,
        \`lastName\`,
        \`fullName\`,
        \`email\`,
        \`password\`,
        \`isSuspended\`,
        \`isDeleted\`
      ) VALUES (
        'Admin',
        'User',
        'Admin User',
        'my-admin@yopmail.com',
        ?,
        0,
        0
      )
    `, [hashedPassword]);

        // Get inserted admin
        const admin = await dataSource.query(
            `SELECT * FROM \`admin\` WHERE \`email\` = 'my-admin@yopmail.com' AND \`isDeleted\` = 0 LIMIT 1`
        );

        console.log('\n========================================');
        console.log('✅ Admin user created successfully!');
        console.log('========================================');
        console.log(`📝 Admin Details:`);
        console.log(`   ID: ${admin[0].id}`);
        console.log(`   Name: ${admin[0].fullName}`);
        console.log(`   Email: ${admin[0].email}`);
        console.log(`   Password: ${password}`);
        console.log('========================================\n');

        console.log('🔐 Login Credentials:');
        console.log(`   Email: my-admin@yopmail.com`);
        console.log(`   Password: Admin@123`);
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        throw error;
    } finally {
        await dataSource.destroy();
        console.log('🔌 Database connection closed.');
    }
}

// Run the seed function
seedAdmin()
    .then(() => {
        console.log('🎉 Seed script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Seed script failed:', error);
        process.exit(1);
    });