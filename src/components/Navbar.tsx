import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="w-full bg-[#121212] px-4 py-3 shadow-sm">
      <div className="flex justify-between items-center w-full">
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
            <span className="text-white font-medium text-sm">yesnodebate</span>
          </Link>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-white hover:text-white font-normal text-xs">
            home
          </Link>
          <Link href="/conversations" className="text-white hover:text-white font-normal text-xs">
            conversations
          </Link>
          <Link href="/about" className="text-white hover:text-white font-normal text-xs">
            about
          </Link>
          <Link href="/manifesto" className="text-white hover:text-white font-normal text-xs">
            manifesto
          </Link>
          <a 
            href="https://x.com/yesnodebates" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-white font-normal text-xs"
          >
            twitter
          </a>
        </div>
        
        <div className="md:hidden">
          {/* Mobile menu button - not implemented for simplicity */}
          <button className="text-white hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
