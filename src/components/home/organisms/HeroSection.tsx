import React, { useEffect, useState } from "react";
import { Heading } from "../../shared/atoms";
import { Paragraph } from "../../shared/atoms";
import { Button } from "../../shared/atoms";
import Image from "next/image";
import Link from "next/link";

interface HeroData {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
}

// Default/Fallback values
const DEFAULTS = {
  title: "Kompetensi Kuat, Masa Depan Hebat",
  subtitle: "Lembaga pelatihan resmi di bidang perdagangan berjangka, mencetak tenaga profesional dengan keterampilan siap kerja dan daya saing global.",
  image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
  cta_text: "Daftar Program",
  cta_link: "/auth/register"
};

export const HeroSection = () => {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/home-about')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) setHero(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Use CMS data or fallback to defaults
  const title = hero?.hero_title || DEFAULTS.title;
  const subtitle = hero?.hero_subtitle || DEFAULTS.subtitle;
  const imageUrl = hero?.hero_image_url || DEFAULTS.image_url;
  const ctaText = hero?.hero_cta_text || DEFAULTS.cta_text;
  const ctaLink = hero?.hero_cta_link || DEFAULTS.cta_link;

  return (
    <section className="w-full flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-zinc-950 min-h-[90vh] transition-colors duration-300">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-200 dark:bg-red-900/40 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-pink-200 dark:bg-pink-900/40 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-yellow-100 dark:bg-yellow-900/40 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-6 lg:px-12 xl:px-24 w-full flex flex-col-reverse md:flex-row items-center justify-between relative z-10 gap-12 py-12 md:py-0">

        {/* Left Content (Text) */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-6 text-left">
          {/* Logo Tag */}
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 py-1.5 px-4 rounded-full border border-red-100 dark:border-red-800 mb-2 shadow-sm">
            <Image
              src="/assets/Logo-Tab.png"
              alt="LPK Merdeka Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">LPK PB Merdeka</span>
          </div>

          <Heading level={1} className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {title.includes(',') ? (
              <>
                {title.split(',')[0]}, <br />
                <span className="text-transparent bg-clip-text bg-red-600 dark:bg-red-500">
                  {title.split(',')[1]?.trim() || ''}
                </span>
              </>
            ) : (
              title
            )}
          </Heading>

          <Paragraph variant="black" className="text-lg md:text-xl leading-relaxed max-w-lg text-gray-800 dark:text-gray-300">
            {subtitle}
          </Paragraph>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <Link href={ctaLink}>
              <Button variant="primary" className="px-8 py-4 text-lg shadow-lg shadow-red-200 dark:shadow-red-900/20 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white w-full sm:w-auto justify-center">
                {ctaText}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" className="px-8 py-4 text-lg bg-white dark:bg-transparent border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 w-full sm:w-auto justify-center">
                Tentang Kami
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 w-full">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
              ].map((src, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-200 overflow-hidden">
                  <Image src={src} width={40} height={40} alt="User" />
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">500+</span> Alumni Sukses
            </div>
          </div>
        </div>

        {/* Right Content (Image) */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
          <div className="relative w-full max-w-md lg:max-w-lg aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-pink-500 rounded-[2rem] transform rotate-6 opacity-20 dark:opacity-40"></div>
            <div className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white dark:border-zinc-700 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              <img
                src={imageUrl}
                alt="Students Learning"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow border border-transparent dark:border-zinc-700">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Resmi</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Terakreditasi BNSP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};