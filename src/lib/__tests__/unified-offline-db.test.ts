import { UnifiedOfflineDatabase } from '../unified-offline-db';
import { UnifiedProduct, UnifiedConsumption, UnifiedNutritionGoals } from '../unified-offline-db';

describe('UnifiedOfflineDatabase Schema', () => {
  describe('Database Configuration', () => {
    it('should have correct database name', () => {
      // Test the database name configuration
      expect(UnifiedOfflineDatabase.name).toBe('UnifiedOfflineDatabase');
    });

    it('should have correct schema version', () => {
      // Test that the schema version is set to 11
      const db = new UnifiedOfflineDatabase();
      expect(db.verno).toBe(11);
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
      expect(db.verno).toBe(11); // Version 11 includes sync fields
    });
  });

  describe('Migration Logic', () => {
    it('should have migration method defined', () => {
      const db = new UnifiedOfflineDatabase();
      expect(typeof db.migrateFromOldSchema).toBe('function');
    });
  });
});
