/**
 * Northwind Fasteners — a fictional supplier used for this demo.
 *
 * This is the only product knowledge the agent is allowed to use when it
 * drafts a reply. Prices are deliberately absent: quoting is a human job.
 */

export type Product = {
  sku: string;
  name: string;
  category: "Bolts" | "Nuts & washers" | "Screws" | "Threaded rod" | "Anchors" | "Rivets" | "Lifting & pipe";
  material: string;
  standard: string | null;
  sizes: string;
  moq: string;
  leadTime: string;
};

export const COMPANY = {
  name: "Northwind Fasteners",
  location: "Sheffield, UK",
  shipsTo: "UK, EU and Norway",
  salesInbox: "sales@northwind-fasteners.example",
  signOff: "Sam Patel, Sales Desk",
} as const;

export const CATALOG: readonly Product[] = [
  {
    sku: "NWF-HB-A4",
    name: "Hex head bolt, full thread",
    category: "Bolts",
    material: "Stainless steel A4-80 (316)",
    standard: "DIN 933 / ISO 4017",
    sizes: "M6–M24, lengths 16–200 mm",
    moq: "500 pcs per size",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-HB-88Z",
    name: "Hex head bolt, part thread",
    category: "Bolts",
    material: "Carbon steel grade 8.8, zinc plated",
    standard: "DIN 931 / ISO 4014",
    sizes: "M6–M30, lengths 30–300 mm",
    moq: "1,000 pcs per size",
    leadTime: "Stock: 2–3 working days",
  },
  {
    sku: "NWF-SB-HV",
    name: "Structural bolt assembly (bolt, nut, 2 washers)",
    category: "Bolts",
    material: "Grade 10.9, hot-dip galvanised",
    standard: "EN 14399-4 (HV), CE marked",
    sizes: "M12–M36, lengths 40–260 mm",
    moq: "200 sets per size",
    leadTime: "8–10 working days",
  },
  {
    sku: "NWF-SH-129",
    name: "Socket head cap screw",
    category: "Screws",
    material: "Alloy steel grade 12.9, black oxide",
    standard: "ISO 4762",
    sizes: "M3–M20, lengths 6–150 mm",
    moq: "500 pcs per size",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-SD-HW",
    name: "Self-drilling screw, hex washer head",
    category: "Screws",
    material: "Case-hardened carbon steel, Class 3 coating",
    standard: "ISO 15480",
    sizes: "4.8–6.3 mm diameter, 19–100 mm",
    moq: "5,000 pcs per size",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-WS-A2",
    name: "Countersunk wood screw, Pozi drive",
    category: "Screws",
    material: "Stainless steel A2 (304)",
    standard: null,
    sizes: "3.5–6.0 mm diameter, 16–120 mm",
    moq: "2,000 pcs per size",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-NN-A4",
    name: "Nyloc (nylon insert) lock nut",
    category: "Nuts & washers",
    material: "Stainless steel A2 or A4",
    standard: "DIN 985 / ISO 10511",
    sizes: "M4–M24",
    moq: "1,000 pcs per size",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-FW-A4",
    name: "Flat washer",
    category: "Nuts & washers",
    material: "Stainless steel A2 or A4",
    standard: "DIN 125 / ISO 7089",
    sizes: "M4–M30",
    moq: "2,000 pcs per size",
    leadTime: "Stock: 2–3 working days",
  },
  {
    sku: "NWF-TR-A4",
    name: "Threaded rod",
    category: "Threaded rod",
    material: "Stainless steel A4-70",
    standard: "DIN 976-1",
    sizes: "M8–M24, 1 m and 3 m lengths",
    moq: "100 lengths per size",
    leadTime: "5–7 working days",
  },
  {
    sku: "NWF-WA-ZP",
    name: "Through-bolt wedge anchor",
    category: "Anchors",
    material: "Carbon steel, zinc plated",
    standard: "ETA Option 7 (non-cracked concrete)",
    sizes: "M8–M20, lengths 75–250 mm",
    moq: "250 pcs per size",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-SA-A4",
    name: "Sleeve anchor, hex nut",
    category: "Anchors",
    material: "Stainless steel A4",
    standard: null,
    sizes: "M8–M16, lengths 60–160 mm",
    moq: "250 pcs per size",
    leadTime: "5–7 working days",
  },
  {
    sku: "NWF-CA-VE",
    name: "Chemical anchor resin, styrene-free vinylester",
    category: "Anchors",
    material: "Vinylester resin, 380 ml coaxial cartridge",
    standard: "ETA Option 1 (cracked concrete)",
    sizes: "380 ml cartridge, M8–M24 studs",
    moq: "24 cartridges",
    leadTime: "Stock: 3–5 working days",
  },
  {
    sku: "NWF-BR-AL",
    name: "Blind rivet, dome head",
    category: "Rivets",
    material: "Aluminium body, steel mandrel",
    standard: "ISO 15983",
    sizes: "3.2–6.4 mm diameter, grip 1.5–20 mm",
    moq: "5,000 pcs per size",
    leadTime: "Stock: 2–3 working days",
  },
  {
    sku: "NWF-UB-HDG",
    name: "U-bolt with nuts and plate",
    category: "Lifting & pipe",
    material: "Carbon steel, hot-dip galvanised",
    standard: null,
    sizes: "Pipe 15–200 NB, thread M8–M20",
    moq: "100 pcs per size",
    leadTime: "7–10 working days",
  },
  {
    sku: "NWF-EB-580",
    name: "Lifting eye bolt, drop forged",
    category: "Lifting & pipe",
    material: "C15E steel, zinc plated, individually load tested",
    standard: "DIN 580",
    sizes: "M8–M36",
    moq: "50 pcs per size",
    leadTime: "8–10 working days",
  },
] as const;

export const CATALOG_SKUS: ReadonlySet<string> = new Set(CATALOG.map((p) => p.sku));

export function getProduct(sku: string): Product | undefined {
  return CATALOG.find((p) => p.sku === sku);
}
