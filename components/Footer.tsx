import { FaInstagram, FaFacebookF, FaLinkedinIn, FaGlobe } from "react-icons/fa";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#0B5D3B] text-white px-6 py-12">
            <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-3">

                {/* Brand */}
                <div>
                    <h2 className="text-lg font-semibold">Dayli Energy</h2>
                    <p className="mt-3 text-sm text-white/80 leading-relaxed">
                        Reliable solar, inverter, and battery solutions powering homes and businesses worldwide.
                    </p>
                </div>

                {/* Contact + Map */}
                <div>
                    <h3 className="text-sm font-semibold mb-4">Contact</h3>

                    <ul className="space-y-3 text-sm text-white/80 mb-4">
                        <li className="flex items-start gap-2">
                            <MapPin size={16} className="mt-0.5" />
                            Plot 11 New Jerusalem City Estate, Igbo Etche Road, Rivers State, Nigeria
                        </li>

                        <li className="flex items-center gap-2">
                            <Phone size={16} />
                            +234 707 811 6598
                        </li>

                        <li className="flex items-center gap-2">
                            <Mail size={16} />
                            support@daylienergy.com
                        </li>
                    </ul>

                    {/* Map Embed */}
                    <div className="w-full h-48 rounded-lg overflow-hidden border border-white/20">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63607.42143555327!2d6.988471945136079!3d4.861665849137844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sPlot%2011%20New%20Jerusalem%20City%20Estate%2C%20Igbo%20Etche%20Road%2C%20Rivers%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1777294236574!5m2!1sen!2sng"
                            className="w-full h-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>

                {/* Socials */}
                <div>
                    <h3 className="text-sm font-semibold mb-4">Socials</h3>

                    <div className="flex gap-4 items-center text-lg">
                        <a href="#" className="hover:opacity-70 transition">
                            <FaInstagram />
                        </a>
                        <a href="#" className="hover:opacity-70 transition">
                            <FaFacebookF />
                        </a>
                        <a href="#" className="hover:opacity-70 transition">
                            <FaLinkedinIn />
                        </a>
                        <a href="#" className="hover:opacity-70 transition">
                            <FaGlobe />
                        </a>
                    </div>

                    <p className="mt-6 text-sm text-white/70">
                        We deliver worldwide 🌍
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/20 text-xs text-white/70 flex flex-col md:flex-row justify-between items-center">
                <p>© {new Date().getFullYear()} Dayli Energy Solutions. All rights reserved.</p>

                <div className="mt-3 md:mt-0 flex gap-4">
                    <a href="#" className="hover:text-white transition">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition">Terms</a>
                </div>
            </div>
        </footer>
    );
}