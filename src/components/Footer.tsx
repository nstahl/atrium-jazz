import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Atrium Jazz. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link 
              href="/about" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="/terms-of-use" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 