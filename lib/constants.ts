export const PRODUCT_CATEGORIES = [
    'Clinical Medicine',
    "Surgery & Women's Health",
    'Diagnostics & Laboratory',
    'Critical Care & Hospital Departments',
    'Specialized Care & Rehabilitation',
    'Dentistry'
] as const

export const EQUIPMENT_HIERARCHY = [
    {
        name: 'Clinical Medicine',
        icon: 'Stethoscope',
        subcategories: [
            'General & Family Medicine',
            'Internal Medicine',
            'Pediatrics',
            'Emergency Medicine',
            'Psychiatry',
            'Infectious Diseases',
            'Cardiology',
            'Neurology',
            'Pulmonology',
            'Gastroenterology',
            'Nephrology & Dialysis',
            'Endocrinology',
            'Hematology & Oncology',
            'Rheumatology',
            'Geriatrics',
            'Reproductive Medicine & IVF',
            'Palliative & Addiction Medicine'
        ]
    },
    {
        name: "Surgery & Women's Health",
        icon: 'Scalpel',
        subcategories: [
            'General Surgery',
            'Obstetrics & Gynecology',
            'Orthopedic Surgery',
            'Neurosurgery',
            'Cardiothoracic & Vascular Surgery',
            'Urology',
            'Plastic & Reconstructive Surgery',
            'Trauma & Sports Medicine',
            'Transplant Surgery',
            'Bariatric Surgery'
        ]
    },
    {
        name: 'Diagnostics & Laboratory',
        icon: 'FlaskConical',
        subcategories: [
            'Radiology & Imaging',
            'Pathology',
            'Medical Laboratory',
            'Nuclear Medicine',
            'Audiology'
        ]
    },
    {
        name: 'Critical Care & Hospital Departments',
        icon: 'Activity',
        subcategories: [
            'Anesthesiology',
            'Intensive & Critical Care (ICU/NICU/CCU)',
            'Operating Room & Surgical Services'
        ]
    },
    {
        name: 'Specialized Care & Rehabilitation',
        icon: 'Accessibility',
        subcategories: [
            'Dermatology',
            'Ophthalmology',
            'ENT (Ear, Nose & Throat)',
            'Physical Therapy & Rehabilitation',
            'Respiratory, Occupational & Speech Therapy',
            'Pain Medicine'
        ]
    },
    {
        name: 'Dentistry',
        icon: 'Smile',
        subcategories: [
            'General Dentistry',
            'Orthodontics',
            'Oral Surgery',
            'Prosthodontics',
            'Periodontics',
            'Endodontics',
            'Pediatric Dentistry'
        ]
    }
] as const

export const CITIES = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Hyderabad',
    'Gujranwala',
    'Sialkot',
    'Sargodha',
    'Bahawalpur',
    'Jhang',
    'Mardan',
    'Abbottabad',
    'Dera Ghazi Khan',
    'Sukkur',
    'Larkana',
    'Mirpur Khas'
] as const

export const BUSINESS_TYPES = [
    'Manufacturer',
    'Distributor',
    'Dealer',
    'Retailer',
    'Service Provider',
    'Importer',
    'Other'
] as const

export const CONDITIONS = ['New', 'Used', 'Refurbished'] as const

export const SPECIALTIES = Array.from(
    new Set(EQUIPMENT_HIERARCHY.flatMap(c => c.subcategories))
).sort()

export const WARRANTIES = [
    'No Warranty',
    '1 Month',
    '3 Months',
    '6 Months',
    '1 Year',
    '2 Years',
    'Manufacturer Warranty'
] as const

export const EQUIPMENT_TYPES = [
    'Capital Equipment',
    'High-Ticket',
    'Imaging',
    'Portable',
    'Clinic Setups',
    'Home Care',
    'Accessories'
] as const
