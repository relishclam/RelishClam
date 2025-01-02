import { db } from './index';

export { db };

async function setupDatabase() {
  try {
    // Only add sample data if the database is empty
    if ((await db.suppliers.count()) === 0) {
      // Add sample suppliers
      await db.suppliers.bulkAdd([
        { id: 1, name: "John's Fishing", contact: "555-0101", licenseNumber: "LIC001" },
        { id: 2, name: "Bay Clams", contact: "555-0102", licenseNumber: "LIC002" },
        { id: 3, name: "Ocean Harvest", contact: "555-0103", licenseNumber: "LIC003" }
      ]);

      // Add sample product grades
      await db.productGrades.bulkAdd([
        {
          id: 1,
          code: 'A',
          name: 'Premium',
          description: 'Highest quality, uniform size, perfect condition',
          productType: 'shell-on'
        },
        {
          id: 2,
          code: 'B',
          name: 'Standard',
          description: 'Good quality, minor variations allowed',
          productType: 'shell-on'
        },
        {
          id: 3,
          code: 'A',
          name: 'Premium',
          description: 'Clean, white meat, no impurities',
          productType: 'meat'
        },
        {
          id: 4,
          code: 'B',
          name: 'Standard',
          description: 'Good quality meat, slight color variations allowed',
          productType: 'meat'
        }
      ]);

      console.log('Sample data added successfully');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Initialize database
db.open()
  .then(setupDatabase)
  .catch(err => {
    console.error('Failed to initialize database:', err);
    // Handle any initialization errors
  });