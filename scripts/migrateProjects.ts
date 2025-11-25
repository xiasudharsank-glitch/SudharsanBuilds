/**
 * Migration script to migrate existing projects from projectsData.ts to Supabase database
 *
 * Run this script ONCE after setting up the database:
 * npm run migrate-projects
 */

import { PROJECTS_DATA } from '../src/data/projectsData';
import { createProject } from '../src/utils/projectsApi';

async function migrateProjects() {
  console.log('🚀 Starting project migration...\n');
  console.log(`Found ${PROJECTS_DATA.length} projects to migrate\n`);

  let successCount = 0;
  let failCount = 0;

  for (const project of PROJECTS_DATA) {
    try {
      console.log(`Migrating: ${project.title}...`);

      const projectId = await createProject(project);

      if (projectId) {
        successCount++;
        console.log(`✅ Successfully migrated: ${project.title}\n`);
      } else {
        failCount++;
        console.log(`❌ Failed to migrate: ${project.title}\n`);
      }
    } catch (error) {
      failCount++;
      console.error(`❌ Error migrating ${project.title}:`, error);
      console.log('');
    }
  }

  console.log('\n========================================');
  console.log('📊 Migration Summary');
  console.log('========================================');
  console.log(`Total projects: ${PROJECTS_DATA.length}`);
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('========================================\n');

  if (successCount === PROJECTS_DATA.length) {
    console.log('🎉 All projects migrated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit /admin to login and manage your projects');
    console.log('2. Verify all projects are displayed correctly');
    console.log('3. Upload project screenshots via the admin panel');
    console.log('4. Publish projects to make them visible on your portfolio\n');
  } else {
    console.log('⚠️  Some projects failed to migrate. Please check the errors above.');
    console.log('You can fix the issues and run the migration again.\n');
  }
}

// Run migration
migrateProjects()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
