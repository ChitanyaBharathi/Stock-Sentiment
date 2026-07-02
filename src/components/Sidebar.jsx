import React from 'react';
import { 
  Home, 
  Wallet, 
  ArrowLeftRight, 
  TrendingUp, 
  ShoppingBag, 
  User, 
  Settings, 
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
    { name: 'Settings', icon: Settings },
    { name: 'Logout', icon: LogOut },
    { name: 'Sessions', icon: Monitor },
  ];

  const handleItemClick = (name) => {
    if (onSelectItem) {
      onSelectItem(name);
    }
  };

  return (
    <aside className="w-64 border-r border-brandBorder bg-cardBg flex flex-col justify-between p-6 select-none h-screen sticky top-0">
      {/* Top Branding Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          {/* Glowing Bull Badge */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              className="w-5 h-5 text-white"
            >
              {/* Bull Head minimal path */}
              <path d="M4 3c0 2 1 4 3 5l2 1.5V13c0 .5.5 1 1 1h4c.5 0 1-.5 1-1V9.5l2-1.5c2-1 3-3 3-5M12 14v4m-3 0h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-sans font-extrabold tracking-tight text-white text-lg">
            SENTIMETER
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
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-black shadow-md shadow-white/5 font-semibold' 
                    : 'text-brandText/40 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary Menu Group */}
      <div className="space-y-1.5 border-t border-brandBorder pt-6">
        {menuGroup2.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          return (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.name)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-brandText/40 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
