export default function Footer() {
    return (
        <footer className="px-6 py-10 border-t text-sm">
            <div className="grid md:grid-cols-4 gap-6">
                <div>Dayli Energy</div>
                <div>Contact</div>
                <div>Location</div>
                <div>Socials</div>
            </div>

            <p className="mt-6 text-gray-500">
                © {new Date().getFullYear()} Dayli Energy Solutions
            </p>
        </footer>
    );
}