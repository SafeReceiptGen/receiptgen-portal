interface generalerrorProps{
    message?:string;
}





export default function generalerror({message}:generalerrorProps){
return (
    <div className="p-4 text-center bg-red-100 text-red-700 rounded">
        {message || "Something went wrong.Please try again."}
    </div>
);
}