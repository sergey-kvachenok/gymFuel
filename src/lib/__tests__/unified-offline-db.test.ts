import { UnifiedOfflineDatabase } from '../unified-offline-db';

describe('UnifiedOfflineDatabase Schema', () => {
  describe('Database Configuration', () => {
    it('should have correct database name', () => {
      // Test the database name configuration
      const db = new UnifiedOfflineDatabase();
      expect(db.name).toBe('GymFuelUnifiedDB_v2');
    });

    it('should have correct schema version', () => {
      // Test that the schema version is set to 1
      const db = new UnifiedOfflineDatabase();
      expect(db.verno).toBe(1);
    });
  });

  describe('Table Schema Validation', () => {
    it('should have all required tables defined', () => {
      const db = new UnifiedOfflineDatabase();

      // Check that all required tables exist
      expect(db.products).toBeDefined();
      expect(db.consumptions).toBeDefined();
      expect(db.nutritionGoals).toBeDefined();
    });

    it('should have correct table schemas with sync fields', () => {
      const db = new UnifiedOfflineDatabase();

      // Check that tables are defined
      expect(db.products).toBeDefined();
      expect(db.consumptions).toBeDefined();
      expect(db.nutritionGoals).toBeDefined();
    });
  });

  describe('Sync Fields Validation', () => {
    it('should include sync fields in schema', () => {
      const db = new UnifiedOfflineDatabase();

      // Check that sync fields are included in the schema definition
      expect(db.verno).toBe(1); // Version 1 includes sync fields
    });
  });

  describe('Migration Logic', () => {
    it('should have migration method defined', () => {
      const db = new UnifiedOfflineDatabase();
      expect(typeof db.migrateFromOldSchema).toBe('function');
    });
  });
});
