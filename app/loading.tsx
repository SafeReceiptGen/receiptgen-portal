export default function loading() {
    return(
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 
            border-b-2 border-gray-800"></div>
            <p className="mt-2 text-gray-700">Loading...</p>
        </div>
    );
}