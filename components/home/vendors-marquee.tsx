'use client'

import Image from 'next/image'

const VENDORS = [
    { name: 'Abbott', logo: '/assets/vendors/Abbott_Laboratories_logo.svg', url: 'https://www.abbott.com' },
    { name: 'Baxter', logo: '/assets/vendors/Baxter.svg', url: 'https://www.baxter.com' },
    { name: 'Becton Dickinson', logo: '/assets/vendors/Becton_Dickinson_logo.svg', url: 'https://www.bd.com' },
    { name: 'Boston Scientific', logo: '/assets/vendors/Boston_Scientific_Logo.svg', url: 'https://www.bostonscientific.com' },
    { name: 'Fresenius Medical Care', logo: '/assets/vendors/Fresenius_Medical_Care_logo.svg', url: 'https://www.freseniusmedicalcare.com' },
    { name: 'GE HealthCare', logo: '/assets/vendors/GE_HealthCare_logo_2023.svg', url: 'https://www.gehealthcare.com' },
    { name: 'Roche', logo: '/assets/vendors/Hoffmann-La_Roche_logo.svg', url: 'https://www.roche.com' },
    { name: 'Intuitive Surgical', logo: '/assets/vendors/Intuitive_Surgical_logo.svg', url: 'https://www.intuitive.com' },
    { name: 'Johnson & Johnson', logo: '/assets/vendors/JNJ_Logo_New.svg', url: 'https://www.jnj.com' },
    { name: 'Medtronic', logo: '/assets/vendors/Medtronic_logo.svg', url: 'https://www.medtronic.com' },
    { name: 'Mindray', logo: '/assets/vendors/Mindray.svg', url: 'https://www.mindray.com' },
    { name: 'Olympus', logo: '/assets/vendors/Olympus_Corporation_logo.svg', url: 'https://www.olympus-global.com' },
    { name: 'Siemens Healthineers', logo: '/assets/vendors/Siemens_Healthineers_logo.svg', url: 'https://www.siemens-healthineers.com' },
    { name: 'Stryker', logo: '/assets/vendors/Stryker_Corporation_logo.svg', url: 'https://www.stryker.com' },
    { name: 'Philips', logo: '/assets/vendors/philips.svg', url: 'https://www.philips.com/healthcare' },
]

export function VendorsMarquee() {
    return (
        <section className="py-10 bg-white border-y border-gray-100 overflow-hidden relative">
            <div className="mx-auto max-w-screen-2xl px-4 text-center mb-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    Available Products by Top International Brands
                </h2>
            </div>

            {/* Gradient Mask for fading edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none mt-16" />
            <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none mt-16" />

            {/* Scrolling Track */}
            <div className="flex w-fit animate-marquee hover:paused items-center">
                {/* We map twice to create an infinite loop effect (-50% translation) */}
                {[...VENDORS, ...VENDORS].map((vendor, idx) => (
                    <a
                        key={`${vendor.name}-${idx}`}
                        href={vendor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-10 flex flex-col items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 min-w-[140px]"
                    >
                        <div className="h-12 w-full relative flex items-center justify-center">
                            <Image
                                src={vendor.logo}
                                alt={vendor.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </a>
                ))}
            </div>

            <style>
                {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
        `}
            </style>
        </section>
    )
}
