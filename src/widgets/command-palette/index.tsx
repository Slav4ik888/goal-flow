// src/widgets/command-palette/index.tsx

import React, { useState } from 'react';
import { useAppDispatch, type AppDispatch } from '@app/providers/store';
import { useHotkeys } from 'react-hotkeys-hook';
import { getCommands } from './commands';
import styles from './index.module.scss';



interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');

  useHotkeys('cmd+k,ctrl+k', (e) => {
    e.preventDefault();
    if (isOpen) onClose();
  });

  if (!isOpen) return null;

  const commands = getCommands();
  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (action: (dispatch: AppDispatch) => void) => {
    action(dispatch);
    onClose();
  };

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
          {filteredCommands.map(cmd => (
            <div
              key={cmd.id}
              className={styles.command}
              onClick={() => handleSelect(cmd.action)}
            >
              <span>{cmd.title}</span>
              {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
            </div>
          ))}
        </div>
        <div className={styles.hint}>
          <span>⌘K</span> для открытия • <span>ESC</span> для закрытия
        </div>
      </div>
    </div>
  );
};
