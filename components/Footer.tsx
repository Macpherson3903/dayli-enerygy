"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Mail, MapPin } from "lucide-react";
import BrandLogo from "@/components/navbar/BrandLogo";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/content/whatsapp";

export default function Footer() {
    const { isSignedIn } = useAuth();
    const isAuthenticated = Boolean(isSignedIn);

    return (
        <footer className="bg-[#0B5D3B] text-white px-6 py-12">
            <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-3">

                {/* Brand */}
                <div>
                    <BrandLogo />

                    <p className="mt-3 text-sm text-white/80 leading-relaxed">
                        Reliable solar, inverter, and battery solutions powering homes and businesses worldwide.
                    </p>
                    <p className="mt-4 text-sm text-white/70">
                        We deliver worldwide 🌍
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-sm font-semibold mb-4">Quick Links</h3>

                    <ul className="space-y-2 text-sm text-white/80">
                        <li>
                            <Link href="/" className="hover:text-white transition">Home</Link>
                        </li>
                        <li>
                            <Link href="/order" className="hover:text-white transition">Order</Link>
                        </li>
                        <li>
                            <Link href="/about" className="hover:text-white transition">About</Link>
                        </li>
                        <li>
                            <Link href="/installation-booking" className="hover:text-white transition">Quotation & installation</Link>
                        </li>
                        <li>
                            <Link
                                href={isAuthenticated ? "/dashboard" : "/account"}
                                className="hover:text-white transition"
                            >
                                {isAuthenticated ? "Dashboard" : "Account"}
                            </Link>
                        </li>
                    </ul>
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
                            <WhatsAppIcon className="h-4 w-4 shrink-0" />
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition underline-offset-2 hover:underline"
                            >
                                {WHATSAPP_DISPLAY}
                            </a>
                        </li>

                        <li className="flex items-center gap-2">
                            <Mail size={16} />
                            support@daylienergy.com
                        </li>
                    </ul>

                    <div className="w-full h-40 rounded-lg overflow-hidden border border-white/20">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63607.42143555327!2d6.988471945136079!3d4.861665849137844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sPlot%2011%20New%20Jerusalem%20City%20Estate%2C%20Igbo%20Etche%20Road%2C%20Rivers%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1777294236574!5m2!1sen!2sng"
                            className="w-full h-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/20 text-xs text-white/70 flex flex-col md:flex-row justify-between items-center">
                <p>© {new Date().getFullYear()} Dayli Energy Solutions. All rights reserved.</p>

                <div className="mt-3 md:mt-0 flex gap-4">
                    <Link href="/privacy-policy" className="hover:text-white transition">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-white transition">
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
}