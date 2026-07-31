import React from 'react';
import { 
  Home, 
  Wallet, 
  ArrowLeftRight, 
  TrendingUp, 
  ShoppingBag, 
  User, 
  LogOut, 
  Monitor 
} from 'lucide-react';

export default function Sidebar({ activeItem = 'Invest', onSelectItem }) {
  const menuGroup1 = [
    { name: 'Home', icon: Home },
    { name: 'Wallet', icon: Wallet },
    { name: 'Transfer', icon: ArrowLeftRight },
    { name: 'Invest', icon: TrendingUp },
    { name: 'Shop', icon: ShoppingBag },
  ];

  const menuGroup2 = [
    { name: 'Personal', icon: User },
    { name: 'Logout', icon: LogOut },
    { name: 'Sessions', icon: Monitor },
  ];

  const handleItemClick = (name) => {
    if (onSelectItem) {
      onSelectItem(name);
    }
  };

  return (
    <aside className="w-64 border-r border-graphite bg-obsidian flex flex-col justify-between p-6 select-none h-screen sticky top-0">
      {/* Top Branding Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          {/* Glowing Bull Badge replaced with Editorial Logo */}
          <span className="font-serif text-[28px] tracking-tight text-white flex items-center">
            <span className="text-copper">S</span>entimeter
          </span>
        </div>

        {/* Primary Menu Group */}
        <nav className="space-y-1.5">
          {menuGroup1.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item.name)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#E8B4B8]/10 text-[#E8B4B8] font-semibold drop-shadow-[0_0_8px_rgba(232,180,184,0.4)]' 
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2px]' : 'stroke-neutral-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary Menu Group */}
      <div className="space-y-1.5 border-t border-graphite pt-6">
        {menuGroup2.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          return (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.name)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#E8B4B8]/10 text-[#E8B4B8] font-semibold drop-shadow-[0_0_8px_rgba(232,180,184,0.4)]' 
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2px]' : 'stroke-neutral-500'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
