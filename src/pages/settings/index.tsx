// src/pages/settings/index.tsx

import React, { useState } from 'react';
import { useAppDispatch } from '@app/providers/store';
import { exportAllData, importDataFromFile } from '@shared/lib/backup';
import { fetchGoals } from '@entities/goal';
import { fetchProjects } from '@entities/project';
import { fetchTasks } from '@entities/task';
import styles from './index.module.scss';

export const SettingsSpace: React.FC = () => {
  const dispatch = useAppDispatch();
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      await exportAllData();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportStatus(null);
    
    try {
      const result = await importDataFromFile(file);
      
      if (result.success) {
        // Перезагружаем данные в Redux
        await dispatch(fetchGoals());
        await dispatch(fetchProjects());
        await dispatch(fetchTasks());
        
        setImportStatus({ type: 'success', message: result.message });
        
        // Очищаем сообщение через 5 секунд
        setTimeout(() => setImportStatus(null), 5000);
      } else {
        setImportStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Ошибка при импорте данных' });
    } finally {
      setIsImporting(false);
      // Очищаем input
      event.target.value = '';
    }
  };

  return (
    <div className={styles.settingsSpace}>
      <h1>⚙️ Настройки</h1>
      
      <div className={styles.section}>
        <h2>Управление данными</h2>
        
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>📦</div>
            <div className={styles.cardInfo}>
              <h3>Экспорт данных</h3>
              <p>Сохраните все цели, проекты и задачи в JSON файл</p>
            </div>
            <button onClick={handleExport} className={styles.exportButton}>
              Экспортировать
            </button>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>📥</div>
            <div className={styles.cardInfo}>
              <h3>Импорт данных</h3>
              <p>Восстановите данные из ранее сохранённого JSON файла</p>
              <p className={styles.warning}>
                ⚠️ Внимание! При импорте текущие данные будут заменены
              </p>
            </div>
            <label className={styles.importButton}>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                hidden
              />
              {isImporting ? 'Импорт...' : 'Импортировать'}
            </label>
          </div>
        </div>
        
        {importStatus && (
          <div className={`${styles.statusMessage} ${styles[importStatus.type]}`}>
            {importStatus.message}
          </div>
        )}
      </div>
      
      <div className={styles.section}>
        <h2>О приложении</h2>
        <div className={styles.aboutCard}>
          <p><strong>GoalFlow</strong> — система управления задачами и временем</p>
          <p>Версия: 1.0.0</p>
          <p>Данные хранятся локально в вашем браузере</p>
          <p>Сделано с ❤️ для продуктивной работы</p>
        </div>
      </div>
    </div>
  );
};
