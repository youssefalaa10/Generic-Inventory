import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../App';
import { LogoutIcon, ShieldCheckIcon } from './Icon';

interface AvatarDropdownProps {
    onViewMyPermissions: () => void;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ onViewMyPermissions }) => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleViewPermissions = () => {
        onViewMyPermissions();
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <div className="avatar-dropdown-container">
            <button 
                ref={buttonRef}
                className="avatar-dropdown-trigger" 
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className="user-greeting">
                    <p className="user-name">{user.name}</p>
                    <p className="user-role">{user.role}</p>
                </div>
                <div className="user-avatar">{user.name.charAt(0)}</div>
            </button>
            
            {isOpen && (
                <div 
                    ref={dropdownRef}
                    className="avatar-dropdown-menu glass-pane"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="avatar-dropdown-info">
                        <strong>{user.name}</strong>
                        <p>{user.role}</p>
                    </div>
                    
                    <div className="avatar-dropdown-divider"></div>
                    
                    <button 
                        className="avatar-dropdown-item" 
                        onClick={handleViewPermissions}
                        role="menuitem"
                    >
                        <ShieldCheckIcon className="icon" />
                        <span>صلاحياتي</span>
                    </button>
                    
                    <div className="avatar-dropdown-divider"></div>
                    
                    <button 
                        className="avatar-dropdown-item logout" 
                        onClick={handleLogout}
                        role="menuitem"
                    >
                        <LogoutIcon className="icon" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarDropdown;
