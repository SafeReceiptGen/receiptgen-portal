'use client'
import { useEffect} from 'react'



export default function Error({
    error,
    reset,
}:{
 error:Error&{ digest?:string}
 reset:()=>void 
}
){
    useEffect(()=>{
        console.error(error)
    },[error]
        
    )
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-8">
<h2 className="text-3lx font-bold text-red-700 mb-4">Something went wrong!</h2>
<p className="text-red-600 mb-6 text-center max-w-md">
    {error.message|| "An unexpected error occured.Please try again."}
</p>


<button onClick={()=>reset()} className="px-6 py-3 bg-red-700 text-white font-semibold rounded hover:bg-red-800 transition">
    Try again
    

</button>

        </div>
    )
}
