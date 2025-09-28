import React from 'react';
import NotificationsDropdown from './NotificationsDropdown';

const Header = () => {
  return (
    <header className="bg-white p-4 border-b flex justify-end items-center">
      {/* Icons */}
      <div className="flex items-center gap-5">
        <NotificationsDropdown />
      </div>
    </header>
  );
};

export default Header;