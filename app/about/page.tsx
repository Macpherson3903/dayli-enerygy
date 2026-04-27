import Navbar from "@/components/Navbar"



export default function About() {
    return (
        <>
        <Navbar />
        <main className="flex items-center justify-center h-screen">
            <div>
                <h1 className="text-5xl uppercase font-bold text-black">This is the About Page.</h1>
            </div>
        </main>
        </>
    )
}