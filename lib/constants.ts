export const PRODUCT_CATEGORIES = [
    'Diagnostic Imaging Equipment',
    'Patient Monitoring & Life Support Equipment',
    'Surgical & Operating Room Equipment',
    'Endoscopy & Minimally Invasive Equipment',
    'Laboratory & Diagnostic Equipment',
    'Sterilization & Infection Control Equipment',
    'Hospital Furniture & Patient Handling Equipment',
    'Rehabilitation & Physiotherapy Equipment',
    'Emergency & Pre-Hospital Equipment',
    'Neonatal & Pediatric Equipment',
    'Home Healthcare Equipment',
    'Oncology & Radiotherapy Equipment',
    'Dialysis & Renal Care Equipment',
    'Medical Infrastructure & Hospital Systems',
    'Medical Consumables, Implants & Disposables'
] as const

export const EQUIPMENT_HIERARCHY = [
    {
        name: 'Diagnostic Imaging Equipment',
        icon: 'ScanEye',
        subcategories: [
            'Digital X-Ray (DR/CR)', 'CT Scanners', 'MRI Systems', 'C-Arm Systems', 'Angiography Suites',
            'PET-CT', 'Mammography', 'Ultrasound Systems', 'PACS / RIS', 'Contrast Injectors', 'Radiation Protection'
        ]
    },
    {
        name: 'Patient Monitoring & Life Support Equipment',
        icon: 'Activity',
        subcategories: [
            'Patient Monitors', 'Central Monitoring Systems', 'Defibrillators', 'Infusion & Syringe Pumps', 'Capnography',
            'ICU Ventilators', 'Transport Ventilators', 'HFNC Systems', 'Anesthesia Workstations'
        ]
    },
    {
        name: 'Surgical & Operating Room Equipment',
        icon: 'Scalpel',
        subcategories: [
            'Open Surgery Sets', 'Energy Devices', 'Smoke Evacuators', 'Trauma Sets', 'Craniotomy Sets',
            'Navigation Systems', 'Neuromonitoring Systems', 'Surgical Lights', 'Operating Tables', 'Electrosurgical Units (ESU)'
        ]
    },
    {
        name: 'Endoscopy & Minimally Invasive Equipment',
        icon: 'Search',
        subcategories: [
            'Rigid & Flexible Endoscopes', 'Endoscopy Towers', 'Surgical Microscopes', 'Laparoscopic Suites',
            'Laparoscopic Gyne Sets', 'Arthroscopy Towers', 'Cystoscopy Systems', 'Ureteroscopy Systems', 'Bronchoscopes'
        ]
    },
    {
        name: 'Laboratory & Diagnostic Equipment',
        icon: 'FlaskConical',
        subcategories: [
            'Hematology Analyzers', 'Biochemistry Analyzers', 'Immunoassay Systems', 'PCR Systems',
            'Coagulation Analyzers', 'Blood Gas Analyzers', 'Centrifuges', 'Biosafety Cabinets', 'Refrigerators & Freezers', 'Microscopes'
        ]
    },
    {
        name: 'Sterilization & Infection Control Equipment',
        icon: 'Sparkles',
        subcategories: [
            'Autoclaves', 'ETO Sterilizers', 'Washer Disinfectors', 'UV Disinfection Systems', 'Waste Management Systems', 'Plasma Sterilizers'
        ]
    },
    {
        name: 'Hospital Furniture & Patient Handling Equipment',
        icon: 'BedDouble',
        subcategories: [
            'Hospital Beds', 'ICU Beds', 'Stretchers', 'Trolleys', 'Cabinets', 'Pressure-Relief Mattresses', 'Patient Hoists', 'Overbed Tables'
        ]
    },
    {
        name: 'Rehabilitation & Physiotherapy Equipment',
        icon: 'Accessibility',
        subcategories: [
            'TENS Units', 'CPM Machines', 'Traction Tables', 'Rehab Cycles', 'Mobility Aids', 'Laser Therapy Units', 'Shockwave Therapy'
        ]
    },
    {
        name: 'Emergency & Pre-Hospital Equipment',
        icon: 'Ambulance',
        subcategories: [
            'Crash Carts', 'Transport Incubators', 'Portable Defibrillators', 'Suction Units', 'Spine Boards', 'Emergency Resuscitation Kits'
        ]
    },
    {
        name: 'Neonatal & Pediatric Equipment',
        icon: 'Baby',
        subcategories: [
            'Infant Incubators', 'Radiant Warmers', 'Phototherapy Units', 'Fetal Monitors', 'Neonatal Ventilators', 'Bassinets'
        ]
    },
    {
        name: 'Home Healthcare Equipment',
        icon: 'HeartPulse',
        subcategories: [
            'CPAP/BiPAP', 'Oxygen Concentrators', 'Home Care Beds', 'Pulse Oximeters', 'Nebulizers', 'Glucometers', 'BP Monitors'
        ]
    },
    {
        name: 'Oncology & Radiotherapy Equipment',
        icon: 'Zap',
        subcategories: [
            'Linear Accelerators (LINAC)', 'Brachytherapy Systems', 'Treatment Planning Systems', 'Dosimetry Equipment'
        ]
    },
    {
        name: 'Dialysis & Renal Care Equipment',
        icon: 'Droplet',
        subcategories: [
            'Hemodialysis Machines', 'CRRT Machines', 'RO Water Plants', 'Peritoneal Dialysis Cyclers', 'Dialyzer Reprocessing Systems'
        ]
    },
    {
        name: 'Medical Infrastructure & Hospital Systems',
        icon: 'Building2',
        subcategories: [
            'Medical Gas Pipeline Systems', 'HVAC & Cleanroom Systems', 'Modular OT Systems', 'Nurse Call Systems',
            'Backup Power Systems', 'Radiation Shielding'
        ]
    },
    {
        name: 'Medical Consumables, Implants & Disposables',
        icon: 'Syringe',
        subcategories: [
            'Surgical Implants', 'Orthopedic Implants', 'Catheters', 'Syringes & Needles', 'PPE', 'Sutures', 'Wound Care Dressings'
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
