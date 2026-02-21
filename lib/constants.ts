export const PRODUCT_CATEGORIES = [
    'Anesthesia & Critical Care',
    'Cardiology & Cath Lab',
    'ENT (Otolaryngology)',
    'Neurosurgery',
    'Orthopedics',
    'Urology',
    'Gynecology & Obstetrics',
    'General Surgery',
    'Medical Imaging & Diagnostics',
    'Laboratory & Research',
    'Primary & Secondary Care',
    'Hygiene & Sterilization',
    'Furniture & Facility',
    'Medical Infrastructure',
    'Dental',
    'Rehabilitation & Physiotherapy',
    'Veterinary',
    'Other'
] as const

export const EQUIPMENT_HIERARCHY = [
    {
        name: 'Anesthesia & Critical Care',
        icon: 'Activity',
        subcategories: [
            'Anesthesia Workstations', 'ICU Ventilators', 'Transport Ventilators', 'HFNC Systems',
            'Patient Monitors', 'Central Monitoring Systems', 'Defibrillators', 'Infusion & Syringe Pumps',
            'Capnography', 'Suction Units', 'Crash Carts'
        ]
    },
    {
        name: 'Cardiology & Cath Lab',
        icon: 'HeartPulse',
        subcategories: [
            'ECG Machines', 'Holter & ABPM Systems', 'Stress Test Systems', 'Echocardiography',
            'Cath Lab Systems', 'Hemodynamic Monitoring', 'Pacemakers', 'IABP Systems'
        ]
    },
    {
        name: 'ENT (Otolaryngology)',
        icon: 'Ear',
        subcategories: [
            'ENT Treatment Units', 'Rigid & Flexible Endoscopes', 'Endoscopy Towers', 'ENT Microscopes',
            'Mastoid Drill Systems', 'Skeeter Drills', 'Burr Systems', 'Microdebriders', 'Audiometers',
            'Tympanometers', 'ASSR', 'ABR/BERA', 'OEA Systems', 'Ear Surgery sets', 'Nose Surgery Sets',
            'FESS Sets', 'Laryngology Sets', 'Ear Microscopic surgery sets', 'Bronchoscopy sets', 'Oesophagscopy sets'
        ]
    },
    {
        name: 'Neurosurgery',
        icon: 'Brain',
        subcategories: [
            'Craniotomy Sets', 'Neuro Drill Systems', 'Navigation Systems', 'Neuromonitoring Systems', 'Neuro Microscopes'
        ]
    },
    {
        name: 'Orthopedics',
        icon: 'Bone',
        subcategories: [
            'Trauma Sets', 'Locking Plate Systems', 'Arthroscopy Towers', 'Power Tools', 'Spine Systems'
        ]
    },
    {
        name: 'Urology',
        icon: 'Accessibility', // Placeholder for Kidney/Urology
        subcategories: [
            'Cystoscopy Systems', 'Ureteroscopy Systems', 'TURP Sets', 'Lithotripters', 'Holmium Lasers', 'Urodynamic Systems'
        ]
    },
    {
        name: 'Gynecology & Obstetrics',
        icon: 'Baby',
        subcategories: [
            'Delivery Tables', 'Hysteroscopy Systems', 'Laparoscopic Gyne Sets', 'Cesarean Sets'
        ]
    },
    {
        name: 'General Surgery',
        icon: 'Scalpel',
        subcategories: [
            'Open Surgery Sets', 'Laparoscopic Towers', 'Energy Devices', 'Smoke Evacuators'
        ]
    },
    {
        name: 'Medical Imaging & Diagnostics',
        icon: 'ScanEye',
        subcategories: [
            'Digital X-Ray (DR/CR)', 'CT Scanners', 'MRI Systems', 'C-Arm Systems', 'Angiography Suites',
            'PET-CT', 'Mammography', 'Ultrasound Systems', 'PACS / RIS', 'Contrast Injectors', 'Radiation Protection'
        ]
    },
    {
        name: 'Laboratory & Research',
        icon: 'FlaskConical',
        subcategories: [
            'Hematology Analyzers', 'Biochemistry Analyzers', 'Immunoassay Systems', 'PCR Systems',
            'Coagulation Analyzers', 'Blood Gas Analyzers', 'Centrifuges', 'Biosafety Cabinets', 'Refrigerators & Freezers'
        ]
    },
    {
        name: 'Primary & Secondary Care',
        icon: 'Stethoscope',
        subcategories: [
            'Examination Tables', 'Diagnostic Sets', 'Stethoscopes', 'BP Monitors', 'Pulse Oximeters',
            'Glucometers', 'Nebulizers', 'Portable Ultrasound', 'Oxygen Concentrators', 'Ward Monitors',
            'Non-Invasive Ventilators', 'Portable X-Ray', 'Bedside Ultrasound', 'Telemetry Systems'
        ]
    },
    {
        name: 'Hygiene & Sterilization',
        icon: 'Sparkles',
        subcategories: [
            'Autoclaves', 'ETO Sterilizers', 'Washer Disinfectors', 'UV Disinfection Systems', 'PPE', 'Waste Management Systems'
        ]
    },
    {
        name: 'Furniture & Facility',
        icon: 'Armchair',
        subcategories: [
            'Hospital Beds', 'ICU Beds', 'Stretchers', 'Trolleys', 'Cabinets', 'Pressure-Relief Mattresses'
        ]
    },
    {
        name: 'Medical Infrastructure',
        icon: 'Building2',
        subcategories: [
            'Medical Gas Pipeline Systems', 'HVAC & Cleanroom Systems', 'Modular OT Systems', 'Nurse Call Systems',
            'Backup Power Systems', 'Radiation Shielding'
        ]
    },
    {
        name: 'Dental',
        icon: 'Smile',
        subcategories: [
            'Dental Chairs', 'Dental Imaging (CBCT / RVG)', 'Implant Systems', 'Endomotors', 'Dental Lasers'
        ]
    },
    {
        name: 'Rehabilitation & Physiotherapy',
        icon: 'Accessibility',
        subcategories: [
            'TENS Units', 'CPM Machines', 'Traction Tables', 'Rehab Cycles', 'Mobility Aids'
        ]
    },
    {
        name: 'Veterinary',
        icon: 'Cat',
        subcategories: [
            'Vet Imaging', 'Vet Surgery', 'Animal Monitoring', 'Vet Sterilization'
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

export const SPECIALTIES = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Dermatology',
    'ICU / Critical Care',
    'General Surgery',
    'Gynecology',
    'Ent',
    'Ophthalmology',
    'Urology',
    'Oncology',
    'Interventional'
] as const

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
