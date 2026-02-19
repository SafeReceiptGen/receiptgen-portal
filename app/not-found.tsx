import Link from 'next/link'


export default function notfound(){
    return(
        <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-3lx font-bold">404 - Page Not Found</h1>
            <p className="text-gray-600">Could not find the requested resource.</p>
        <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
            Return Home 
        </Link>
        
        </div>
    );
}