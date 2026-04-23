// src/widgets/command-palette/index.tsx

import React, { useState } from 'react';
import styles from './index.module.scss';
import { useNavigate } from 'react-router-dom';
import { exportAllData } from '@features/export';



interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const commands = [
    // { 
    //   id: 'new-task', 
    //   title: 'Новая задача', 
    //   shortcut: 'N',
    //   action: () => {
    //     // Открываем Quick Capture
    //     window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', metaKey: true }));
    //     onClose();
    //   }
    // },
    { 
      id: 'view-goals', 
      title: 'Перейти к целям', 
      shortcut: 'G',
      action: () => {
        navigate('/goals');
        onClose();
      }
    },
    { 
      id: 'view-projects', 
      title: 'Перейти к проектам', 
      shortcut: 'P',
      action: () => {
        navigate('/projects');
        onClose();
      }
    },
    { 
      id: 'view-tasks', 
      title: 'Перейти к задачам', 
      shortcut: 'T',
      action: () => {
        navigate('/');
        onClose();
      }
    },
    { 
      id: 'export-data', 
      title: 'Экспорт данных', 
      shortcut: 'ctrl+E',
      action: () => {
        exportAllData();
        onClose();
      }
    },
  ];
  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (action: () => void) => {
    action();
    onClose();
  };
  

  if (!isOpen) return null;
  

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          type="text"
          placeholder="Поиск команд... (N - новая задача, / - поиск)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.input}
        />
        <div className={styles.commands}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                className={styles.command}
                onClick={() => handleSelect(cmd.action)}
              >
                <span>{cmd.title}</span>
                {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>Ничего не найдено</div>
          )}
        </div>
        <div className={styles.hint}>
          <span>⌘K</span> для открытия • <span>ESC</span> для закрытия • 
          <span> ↑↓</span> для навигации • <span>⏎</span> для выбора
        </div>
      </div>
    </div>
  );
};
