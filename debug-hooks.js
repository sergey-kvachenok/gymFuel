// Debug script to test IndexedDB data and see what's actually stored
console.log('🐛 Starting debug of offline hooks...');

// Function to check IndexedDB data
async function debugIndexedDB() {
  console.log('\n📊 Checking IndexedDB data...');
  
  try {
    // Open the database
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('GymFuelDb', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    console.log('✅ Connected to IndexedDB');
    
    // Check each store
    const stores = ['products', 'consumption', 'goals', 'syncOperations'];
    
    for (const storeName of stores) {
      if (db.objectStoreNames.contains(storeName)) {
        const data = await new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        console.log(`📦 ${storeName}: ${data.length} items`);
        if (data.length > 0) {
          console.log(`   Sample:`, data[0]);
          
          // Special logging for consumption to check dates
          if (storeName === 'consumption') {
            console.log('📅 Consumption dates:');
            data.forEach((item, i) => {
              if (i < 5) { // Show first 5
                console.log(`   ${i + 1}. Date: ${new Date(item.date).toISOString().split('T')[0]}, Created: ${new Date(item.createdAt).toISOString().split('T')[0]}`);
              }
            });
          }
        }
      } else {
        console.log(`❌ ${storeName}: Store does not exist`);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('❌ IndexedDB debug failed:', error);
  }
}

// Function to test network status
function debugNetworkStatus() {
  console.log('\n🌐 Network Status Debug:');
  console.log('navigator.onLine:', navigator.onLine);
  
  // Test network change events
  window.addEventListener('online', () => {
    console.log('🟢 Network event: ONLINE');
  });
  
  window.addEventListener('offline', () => {
    console.log('🔴 Network event: OFFLINE');
  });
}

// Function to test localStorage cache
function debugLocalStorage() {
  console.log('\n💾 LocalStorage Debug:');
  const cachedUserId = localStorage.getItem('cachedUserId');
  console.log('cachedUserId:', cachedUserId);
  
  // List all localStorage keys that might be related
  const keys = Object.keys(localStorage);
  const relevantKeys = keys.filter(key => 
    key.includes('user') || 
    key.includes('cache') || 
    key.includes('offline') ||
    key.includes('session')
  );
  
  console.log('Relevant localStorage keys:', relevantKeys);
  relevantKeys.forEach(key => {
    console.log(`  ${key}:`, localStorage.getItem(key));
  });
}

// Function to simulate offline storage getDailyStats call
async function debugGetDailyStats() {
  console.log('\n📊 Testing getDailyStats manually...');
  
  const cachedUserId = localStorage.getItem('cachedUserId');
  if (!cachedUserId) {
    console.log('❌ No cached userId found');
    return;
  }
  
  const userId = parseInt(cachedUserId);
  console.log('Using userId:', userId);
  
  // Test for today and past few days
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      // Simulate what getDailyStats does
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('GymFuelDb', 2);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Get consumption by date
      const consumptions = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['consumption'], 'readonly');
        const store = transaction.objectStore('consumption');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = () => {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          const filtered = request.result.filter(consumption => {
            const consumptionDate = new Date(consumption.date);
            return consumptionDate >= startOfDay && consumptionDate <= endOfDay;
          });
          
          resolve(filtered);
        };
        request.onerror = () => reject(request.error);
      });
      
      console.log(`📅 ${dateStr}: ${consumptions.length} consumptions found`);
      
      db.close();
    } catch (error) {
      console.error(`❌ Error testing ${dateStr}:`, error);
    }
  }
}

// Run all debug functions
async function runAllDebug() {
  console.log('🐛 Starting comprehensive offline debug...');
  debugNetworkStatus();
  debugLocalStorage();
  await debugIndexedDB();
  await debugGetDailyStats();
  
  console.log('\n✅ Debug complete! Check the logs above for issues.');
  console.log('\n💡 Common issues:');
  console.log('1. No cached userId - need to login online first');
  console.log('2. Empty consumption table - need to use app online to cache data');
  console.log('3. Wrong date format in consumption.date field');
  console.log('4. Components not actually using new hooks');
}

// Auto-run after a short delay
setTimeout(runAllDebug, 1000);

// Export for manual testing
window.debugOffline = {
  runAllDebug,
  debugIndexedDB,
  debugNetworkStatus,
  debugLocalStorage,
  debugGetDailyStats
};