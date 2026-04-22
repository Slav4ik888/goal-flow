// src/shared/mocks/init.ts

import { mockGoals, mockProjects, mockTasks } from './data';


// Функция для полной очистки базы данных
export async function clearAllData() {
  const { clearAllStores } = await import('@shared/lib/db');
  
  try {
    console.log('🗑️ Starting database cleanup...');
    
    // Очищаем все хранилища
    await clearAllStores();
    
    console.log('✅ Database cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    throw error;
  }
}
// Функция для принудительной очистки и переинициализации (исправленная)
export async function resetAndInitializeMockData() {
  const { initDB, saveGoal, saveProject, saveTask } = await import('@shared/lib/db');
  
  try {
    console.log('🔄 Resetting database...');
    
    // Удаляем существующую базу
    await clearAllData();
    
    // Создаем новую базу
    await initDB();
    
    // Инициализируем с моками
    console.log('📦 Initializing mock data...');
    
    for (const goal of mockGoals) {
      await saveGoal(goal);
    }
    
    for (const project of mockProjects) {
      await saveProject(project);
    }
    
    for (const task of mockTasks) {
      await saveTask(task);
    }
    
    console.log('✅ Database reset and reinitialized with mock data');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    return false;
  }
}

// Обновленная функция initializeMockData
export async function initializeMockData() {
  const { initDB, saveGoal, saveProject, saveTask, getGoals } = await import('@shared/lib/db');
  
  try {
    await initDB();
    
    // Проверяем, есть ли уже данные
    const existingGoals = await getGoals();
    
    if (existingGoals.length > 0) {
      console.log('⚠️ Database already contains data. Please clear it first.');
      return false;
    }
    
    console.log('🔄 Initializing mock data...');
    
    // Сохраняем цели
    for (const goal of mockGoals) {
      await saveGoal(goal);
    }
    
    // Сохраняем проекты
    for (const project of mockProjects) {
      await saveProject(project);
    }
    
    // Сохраняем задачи
    for (const task of mockTasks) {
      await saveTask(task);
    }
    
    console.log('✅ Mock data initialized successfully!');
    console.log(`📊 Stats: ${mockGoals.length} goals, ${mockProjects.length} projects, ${mockTasks.length} tasks`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize mock data:', error);
    return false;
  }
}
