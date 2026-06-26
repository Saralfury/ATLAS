import type { RouteData } from "@/types/port.types";

// ============================================================================
//  MARITIME CORRIDOR SYSTEM
// ============================================================================
//
//  Reusable offshore waypoint sequences that routes compose to create
//  realistic maritime paths. Waypoints are [lat, lon] visualization metadata
//  only — they do NOT affect simulation, graph topology, or routing logic.
//
//  Corridors are defined in canonical geographic order so routes can slice
//  and reverse segments as needed.
// ============================================================================

/** West coast corridor: Mumbai area south to Kerala (N → S).
 *  Ships traveling the Konkan/Malabar coast follow these offshore waypoints. */
const WEST_COAST: [number, number][] = [
  [17.0, 72.0],   // Off Ratnagiri / Konkan coast
  [14.5, 73.0],   // Off Goa / Karnataka coast
  [12.0, 74.0],   // Off Mangalore coast
  [10.5, 75.0],   // Off northern Kerala coast
];

/** Cape Comorin corridor: Rounding India's southern tip (W → E).
 *  Routes pass south of Kanyakumari through open Indian Ocean. */
const CAPE_COMORIN: [number, number][] = [
  [8.0, 76.0],    // Off southern Kerala coast
  [6.5, 77.5],    // South of Kanyakumari, Indian Ocean
  [7.0, 79.0],    // Southeast of cape, approaching east coast
];

/** East coast corridor: Southern Tamil Nadu to Vizag area (S → N).
 *  Ships follow the Coromandel / Andhra coast offshore. */
const EAST_COAST: [number, number][] = [
  [9.0, 79.5],    // Off Tuticorin / Gulf of Mannar
  [10.5, 80.5],   // Off southern Tamil Nadu
  [12.0, 80.8],   // Off Pondicherry / Cuddalore
  [13.5, 81.0],   // Off Chennai area
  [15.5, 81.5],   // Off Andhra Pradesh coast
  [17.5, 84.0],   // Off Visakhapatnam area
];

/** Bay of Bengal corridor: Odisha coast to Kolkata approach (S → N).
 *  Northeast approach for Odisha / Bengal ports. */
const BAY_OF_BENGAL: [number, number][] = [
  [19.0, 85.5],   // Off Odisha coast
  [20.5, 87.0],   // Off northern Odisha / Bengal border
  [21.5, 88.0],   // Approaching Hooghly river mouth
];

/** Arabian Sea / Saurashtra bypass corridor (S → N).
 *  Ships going around the Saurashtra/Kathiawar peninsula route through
 *  the Arabian Sea west of Gujarat. */
const ARABIAN_SEA: [number, number][] = [
  [19.5, 69.5],   // Off Diu, south of Saurashtra
  [21.5, 68.0],   // West of Saurashtra mid-coast
  [23.0, 68.5],   // Off Kutch, north of Saurashtra
];

// ============================================================================
//  HELPER
// ============================================================================

/** Reverse a corridor segment (for routes traveling in the opposite direction). */
const rev = (arr: [number, number][]): [number, number][] => [...arr].reverse();

// ============================================================================
//  TYPE EXTENSION
// ============================================================================

/** Extends RouteData with optional visualization-only sea waypoints. */
export interface SeaRouteData extends RouteData {
  /** Ordered [lat, lon] waypoints for realistic offshore path rendering.
   *  When present, the map uses calculateSeaRoutePath() instead of Bézier. */
  seaWaypoints?: [number, number][];
}

// ============================================================================
//  ROUTE DEFINITIONS
// ============================================================================
//
//  Each route entry preserves ALL original fields exactly as before.
//  The `seaWaypoints` field is added ONLY to routes whose direct Bézier
//  curve would cross mainland India or the Saurashtra peninsula.
//
//  Routes between nearby same-coast ports (e.g. Kolkata↔Haldia, Vizag↔Gangavaram,
//  Hazira↔Dahej, Chennai↔Ennore) do NOT need waypoints because their short
//  Bézier arcs stay over water.
//
//  Corridor composition examples:
//    Mumbai→Chennai:  WEST_COAST + CAPE_COMORIN + EAST_COAST[0..3]
//    Chennai→Mumbai:  rev(EAST_COAST[0..3]) + rev(CAPE_COMORIN) + rev(WEST_COAST)
//    Mumbai→Kolkata:  WEST_COAST + CAPE_COMORIN + EAST_COAST + BAY_OF_BENGAL
// ============================================================================

export const ROUTES: SeaRouteData[] = [
  // ── Mumbai ↔ Mundra ─────────────────────────────────────────────────
  // Crosses upper Saurashtra — route via Arabian Sea west of Gujarat
  {
    "source_port": 1,
    "destination_port": 2,
    "traffic_volume": 7500,
    "distance_nm": 380.0,
    seaWaypoints: [
      [18.0, 71.5],       // Offshore Mumbai heading NW
      ...ARABIAN_SEA,      // Around Saurashtra
    ],
  },
  {
    "source_port": 2,
    "destination_port": 1,
    "traffic_volume": 8000,
    "distance_nm": 380.0,
    seaWaypoints: [
      ...rev(ARABIAN_SEA),
      [18.0, 71.5],
    ],
  },

  // ── Mumbai ↔ Kandla ─────────────────────────────────────────────────
  // Crosses Saurashtra — route via Arabian Sea
  {
    "source_port": 1,
    "destination_port": 8,
    "traffic_volume": 4500,
    "distance_nm": 420.0,
    seaWaypoints: [
      [18.0, 71.5],
      ...ARABIAN_SEA,
    ],
  },
  {
    "source_port": 8,
    "destination_port": 1,
    "traffic_volume": 5000,
    "distance_nm": 420.0,
    seaWaypoints: [
      ...rev(ARABIAN_SEA),
      [18.0, 71.5],
    ],
  },

  // ── Mundra ↔ Kandla ─────────────────────────────────────────────────
  // Both in Gulf of Kutch — short Bézier OK
  {
    "source_port": 2,
    "destination_port": 8,
    "traffic_volume": 3500,
    "distance_nm": 50.0
  },
  {
    "source_port": 8,
    "destination_port": 2,
    "traffic_volume": 4000,
    "distance_nm": 50.0
  },

  // ── Mundra ↔ Hazira ─────────────────────────────────────────────────
  // Crosses Saurashtra peninsula — route via Arabian Sea + Gulf of Khambhat
  {
    "source_port": 2,
    "destination_port": 14,
    "traffic_volume": 2800,
    "distance_nm": 200.0,
    seaWaypoints: [
      ...rev(ARABIAN_SEA),       // South around Saurashtra
      [20.0, 71.5],              // Approaching Gulf of Khambhat
    ],
  },
  {
    "source_port": 14,
    "destination_port": 2,
    "traffic_volume": 3000,
    "distance_nm": 200.0,
    seaWaypoints: [
      [20.0, 71.5],
      ...ARABIAN_SEA,
    ],
  },

  // ── Hazira ↔ Mumbai ─────────────────────────────────────────────────
  // Same coast (Konkan), short — Bézier OK
  {
    "source_port": 14,
    "destination_port": 1,
    "traffic_volume": 3500,
    "distance_nm": 200.0
  },
  {
    "source_port": 1,
    "destination_port": 14,
    "traffic_volume": 3200,
    "distance_nm": 200.0
  },

  // ── Hazira ↔ Pipavav ────────────────────────────────────────────────
  // Across Gulf of Khambhat — water — Bézier OK
  {
    "source_port": 14,
    "destination_port": 15,
    "traffic_volume": 1800,
    "distance_nm": 150.0
  },
  {
    "source_port": 15,
    "destination_port": 14,
    "traffic_volume": 2000,
    "distance_nm": 150.0
  },

  // ── Pipavav ↔ Mundra ────────────────────────────────────────────────
  // Crosses Saurashtra — route via Arabian Sea
  {
    "source_port": 15,
    "destination_port": 2,
    "traffic_volume": 2200,
    "distance_nm": 250.0,
    seaWaypoints: [
      [20.0, 70.0],              // SW off Saurashtra coast
      [21.5, 68.0],              // West of Saurashtra
      [23.0, 68.5],              // NW approaching Mundra
    ],
  },
  {
    "source_port": 2,
    "destination_port": 15,
    "traffic_volume": 2500,
    "distance_nm": 250.0,
    seaWaypoints: [
      [23.0, 68.5],
      [21.5, 68.0],
      [20.0, 70.0],
    ],
  },

  // ── Kandla ↔ Okha ───────────────────────────────────────────────────
  // Gulf of Kutch — Bézier OK
  {
    "source_port": 8,
    "destination_port": 25,
    "traffic_volume": 900,
    "distance_nm": 200.0
  },
  {
    "source_port": 25,
    "destination_port": 8,
    "traffic_volume": 1000,
    "distance_nm": 200.0
  },

  // ── Okha ↔ Porbandar ────────────────────────────────────────────────
  // West Gujarat coast — Bézier OK
  {
    "source_port": 25,
    "destination_port": 26,
    "traffic_volume": 380,
    "distance_nm": 80.0
  },
  {
    "source_port": 26,
    "destination_port": 25,
    "traffic_volume": 400,
    "distance_nm": 80.0
  },

  // ── Porbandar ↔ Mundra ──────────────────────────────────────────────
  // West Gujarat coast — Bézier OK
  {
    "source_port": 26,
    "destination_port": 2,
    "traffic_volume": 500,
    "distance_nm": 200.0
  },
  {
    "source_port": 2,
    "destination_port": 26,
    "traffic_volume": 550,
    "distance_nm": 200.0
  },

  // ── Hazira ↔ Dahej ──────────────────────────────────────────────────
  // Gulf of Khambhat neighbors — Bézier OK
  {
    "source_port": 14,
    "destination_port": 16,
    "traffic_volume": 1400,
    "distance_nm": 40.0
  },
  {
    "source_port": 16,
    "destination_port": 14,
    "traffic_volume": 1500,
    "distance_nm": 40.0
  },

  // ── Pipavav ↔ Bhavnagar ─────────────────────────────────────────────
  // Gulf of Khambhat — Bézier OK
  {
    "source_port": 15,
    "destination_port": 24,
    "traffic_volume": 750,
    "distance_nm": 100.0
  },
  {
    "source_port": 24,
    "destination_port": 15,
    "traffic_volume": 800,
    "distance_nm": 100.0
  },

  // ── Mumbai ↔ Dighi ──────────────────────────────────────────────────
  // Neighbors on Konkan coast — Bézier OK
  {
    "source_port": 1,
    "destination_port": 28,
    "traffic_volume": 900,
    "distance_nm": 100.0
  },
  {
    "source_port": 28,
    "destination_port": 1,
    "traffic_volume": 1000,
    "distance_nm": 100.0
  },

  // ── Mumbai ↔ Mormugao ───────────────────────────────────────────────
  // Down Konkan coast — Bézier OK
  {
    "source_port": 1,
    "destination_port": 12,
    "traffic_volume": 1800,
    "distance_nm": 350.0
  },
  {
    "source_port": 12,
    "destination_port": 1,
    "traffic_volume": 2000,
    "distance_nm": 350.0
  },

  // ── Mormugao ↔ Redi ─────────────────────────────────────────────────
  // Neighbors — Bézier OK
  {
    "source_port": 12,
    "destination_port": 29,
    "traffic_volume": 450,
    "distance_nm": 80.0
  },
  {
    "source_port": 29,
    "destination_port": 12,
    "traffic_volume": 500,
    "distance_nm": 80.0
  },

  // ── Mormugao ↔ New Mangalore ────────────────────────────────────────
  // West coast neighbors — Bézier OK
  {
    "source_port": 12,
    "destination_port": 11,
    "traffic_volume": 1400,
    "distance_nm": 150.0
  },
  {
    "source_port": 11,
    "destination_port": 12,
    "traffic_volume": 1500,
    "distance_nm": 150.0
  },

  // ── New Mangalore ↔ Beypore ─────────────────────────────────────────
  // West coast neighbors — Bézier OK
  {
    "source_port": 11,
    "destination_port": 27,
    "traffic_volume": 750,
    "distance_nm": 100.0
  },
  {
    "source_port": 27,
    "destination_port": 11,
    "traffic_volume": 800,
    "distance_nm": 100.0
  },

  // ── Beypore ↔ Kochi ─────────────────────────────────────────────────
  // Kerala coast neighbors — Bézier OK
  {
    "source_port": 27,
    "destination_port": 7,
    "traffic_volume": 550,
    "distance_nm": 80.0
  },
  {
    "source_port": 7,
    "destination_port": 27,
    "traffic_volume": 600,
    "distance_nm": 80.0
  },

  // ── New Mangalore ↔ Kochi ───────────────────────────────────────────
  // West coast — Bézier OK
  {
    "source_port": 11,
    "destination_port": 7,
    "traffic_volume": 1800,
    "distance_nm": 250.0
  },
  {
    "source_port": 7,
    "destination_port": 11,
    "traffic_volume": 2000,
    "distance_nm": 250.0
  },

  // ── Kolkata ↔ Haldia ────────────────────────────────────────────────
  // River neighbors — Bézier OK
  {
    "source_port": 4,
    "destination_port": 5,
    "traffic_volume": 2800,
    "distance_nm": 60.0
  },
  {
    "source_port": 5,
    "destination_port": 4,
    "traffic_volume": 3000,
    "distance_nm": 60.0
  },

  // ── Haldia ↔ Dhamra ─────────────────────────────────────────────────
  // Bengal/Odisha coast — Bézier OK
  {
    "source_port": 5,
    "destination_port": 19,
    "traffic_volume": 900,
    "distance_nm": 150.0
  },
  {
    "source_port": 19,
    "destination_port": 5,
    "traffic_volume": 1000,
    "distance_nm": 150.0
  },

  // ── Haldia ↔ Paradip ────────────────────────────────────────────────
  // Bay of Bengal coast — Bézier OK
  {
    "source_port": 5,
    "destination_port": 9,
    "traffic_volume": 2200,
    "distance_nm": 200.0
  },
  {
    "source_port": 9,
    "destination_port": 5,
    "traffic_volume": 2500,
    "distance_nm": 200.0
  },

  // ── Dhamra ↔ Paradip ────────────────────────────────────────────────
  // Odisha coast neighbors — Bézier OK
  {
    "source_port": 19,
    "destination_port": 9,
    "traffic_volume": 750,
    "distance_nm": 80.0
  },
  {
    "source_port": 9,
    "destination_port": 19,
    "traffic_volume": 800,
    "distance_nm": 80.0
  },

  // ── Paradip ↔ Gopalpur ──────────────────────────────────────────────
  // Odisha coast — Bézier OK
  {
    "source_port": 9,
    "destination_port": 20,
    "traffic_volume": 550,
    "distance_nm": 200.0
  },
  {
    "source_port": 20,
    "destination_port": 9,
    "traffic_volume": 600,
    "distance_nm": 200.0
  },

  // ── Gopalpur ↔ Visakhapatnam ────────────────────────────────────────
  // East coast neighbors — Bézier OK
  {
    "source_port": 20,
    "destination_port": 6,
    "traffic_volume": 750,
    "distance_nm": 250.0
  },
  {
    "source_port": 6,
    "destination_port": 20,
    "traffic_volume": 800,
    "distance_nm": 250.0
  },

  // ── Visakhapatnam ↔ Gangavaram ──────────────────────────────────────
  // Neighbors (same city) — Bézier OK
  {
    "source_port": 6,
    "destination_port": 18,
    "traffic_volume": 2800,
    "distance_nm": 10.0
  },
  {
    "source_port": 18,
    "destination_port": 6,
    "traffic_volume": 3000,
    "distance_nm": 10.0
  },

  // ── Visakhapatnam ↔ Kakinada ────────────────────────────────────────
  // East coast neighbors — Bézier OK
  {
    "source_port": 6,
    "destination_port": 23,
    "traffic_volume": 1400,
    "distance_nm": 100.0
  },
  {
    "source_port": 23,
    "destination_port": 6,
    "traffic_volume": 1500,
    "distance_nm": 100.0
  },

  // ── Kakinada ↔ Gangavaram ───────────────────────────────────────────
  // East coast neighbors — Bézier OK
  {
    "source_port": 23,
    "destination_port": 18,
    "traffic_volume": 1100,
    "distance_nm": 110.0
  },
  {
    "source_port": 18,
    "destination_port": 23,
    "traffic_volume": 1200,
    "distance_nm": 110.0
  },

  // ── Kakinada ↔ Krishnapatnam ────────────────────────────────────────
  // East coast — Bézier OK
  {
    "source_port": 23,
    "destination_port": 17,
    "traffic_volume": 800,
    "distance_nm": 250.0
  },
  {
    "source_port": 17,
    "destination_port": 23,
    "traffic_volume": 900,
    "distance_nm": 250.0
  },

  // ── Krishnapatnam ↔ Ennore ──────────────────────────────────────────
  // East coast neighbors — Bézier OK
  {
    "source_port": 17,
    "destination_port": 10,
    "traffic_volume": 1400,
    "distance_nm": 160.0
  },
  {
    "source_port": 10,
    "destination_port": 17,
    "traffic_volume": 1500,
    "distance_nm": 160.0
  },

  // ── Ennore ↔ Chennai ────────────────────────────────────────────────
  // Neighbors (~20nm) — Bézier OK
  {
    "source_port": 10,
    "destination_port": 3,
    "traffic_volume": 3800,
    "distance_nm": 20.0
  },
  {
    "source_port": 3,
    "destination_port": 10,
    "traffic_volume": 4000,
    "distance_nm": 20.0
  },

  // ── Chennai ↔ Krishnapatnam ─────────────────────────────────────────
  // East coast — Bézier OK
  {
    "source_port": 3,
    "destination_port": 17,
    "traffic_volume": 1800,
    "distance_nm": 180.0
  },
  {
    "source_port": 17,
    "destination_port": 3,
    "traffic_volume": 2000,
    "distance_nm": 180.0
  },

  // ── Chennai ↔ Karaikal ──────────────────────────────────────────────
  // Coromandel coast — Bézier OK
  {
    "source_port": 3,
    "destination_port": 21,
    "traffic_volume": 900,
    "distance_nm": 250.0
  },
  {
    "source_port": 21,
    "destination_port": 3,
    "traffic_volume": 1000,
    "distance_nm": 250.0
  },

  // ── Karaikal ↔ Nagapattinam ─────────────────────────────────────────
  // Neighbors — Bézier OK
  {
    "source_port": 21,
    "destination_port": 22,
    "traffic_volume": 750,
    "distance_nm": 30.0
  },
  {
    "source_port": 22,
    "destination_port": 21,
    "traffic_volume": 800,
    "distance_nm": 30.0
  },

  // ── Nagapattinam ↔ Cuddalore ────────────────────────────────────────
  // Coromandel coast neighbors — Bézier OK
  {
    "source_port": 22,
    "destination_port": 30,
    "traffic_volume": 550,
    "distance_nm": 80.0
  },
  {
    "source_port": 30,
    "destination_port": 22,
    "traffic_volume": 600,
    "distance_nm": 80.0
  },

  // ── Nagapattinam ↔ Tuticorin ────────────────────────────────────────
  // Southern Tamil Nadu coast — Bézier OK (short, along coast)
  {
    "source_port": 22,
    "destination_port": 13,
    "traffic_volume": 900,
    "distance_nm": 200.0
  },
  {
    "source_port": 13,
    "destination_port": 22,
    "traffic_volume": 1000,
    "distance_nm": 200.0
  },

  // ── Chennai ↔ Tuticorin ─────────────────────────────────────────────
  // Crosses inland Tamil Nadu — offshore via Coromandel coast
  {
    "source_port": 3,
    "destination_port": 13,
    "traffic_volume": 2200,
    "distance_nm": 350.0,
    seaWaypoints: [
      [12.0, 80.8],    // Off Pondicherry, offshore
      [10.5, 80.5],    // Off southern Coromandel coast
      [9.5, 79.5],     // Off Rameswaram / Gulf of Mannar
    ],
  },
  {
    "source_port": 13,
    "destination_port": 3,
    "traffic_volume": 2500,
    "distance_nm": 350.0,
    seaWaypoints: [
      [9.5, 79.5],
      [10.5, 80.5],
      [12.0, 80.8],
    ],
  },

  // ── Mumbai ↔ Chennai ────────────────────────────────────────────────
  // CROSS-PENINSULA: Via west coast → Cape Comorin → east coast
  {
    "source_port": 1,
    "destination_port": 3,
    "traffic_volume": 5500,
    "distance_nm": 700.0,
    seaWaypoints: [
      ...WEST_COAST,
      ...CAPE_COMORIN,
      ...EAST_COAST.slice(0, 4),  // Up to Chennai latitude
    ],
  },
  {
    "source_port": 3,
    "destination_port": 1,
    "traffic_volume": 6000,
    "distance_nm": 700.0,
    seaWaypoints: [
      ...rev(EAST_COAST.slice(0, 4)),
      ...rev(CAPE_COMORIN),
      ...rev(WEST_COAST),
    ],
  },

  // ── Mumbai ↔ Kochi ──────────────────────────────────────────────────
  // Long west coast — may clip Western Ghats — use offshore waypoints
  {
    "source_port": 1,
    "destination_port": 7,
    "traffic_volume": 2200,
    "distance_nm": 550.0,
    seaWaypoints: WEST_COAST,
  },
  {
    "source_port": 7,
    "destination_port": 1,
    "traffic_volume": 2500,
    "distance_nm": 550.0,
    seaWaypoints: rev(WEST_COAST),
  },

  // ── Kochi ↔ Chennai ─────────────────────────────────────────────────
  // CROSS-PENINSULA: Via Cape Comorin → east coast
  {
    "source_port": 7,
    "destination_port": 3,
    "traffic_volume": 2800,
    "distance_nm": 350.0,
    seaWaypoints: [
      ...CAPE_COMORIN,
      ...EAST_COAST.slice(0, 4),
    ],
  },
  {
    "source_port": 3,
    "destination_port": 7,
    "traffic_volume": 3000,
    "distance_nm": 350.0,
    seaWaypoints: [
      ...rev(EAST_COAST.slice(0, 4)),
      ...rev(CAPE_COMORIN),
    ],
  },

  // ── Kochi ↔ Tuticorin ───────────────────────────────────────────────
  // CROSS-TIP: Opposite sides of peninsula tip — round Kanyakumari
  {
    "source_port": 7,
    "destination_port": 13,
    "traffic_volume": 1400,
    "distance_nm": 200.0,
    seaWaypoints: [
      [8.5, 76.0],    // South along Kerala coast
      [7.0, 77.5],    // South of Kanyakumari
      [7.5, 78.0],    // East of cape
    ],
  },
  {
    "source_port": 13,
    "destination_port": 7,
    "traffic_volume": 1500,
    "distance_nm": 200.0,
    seaWaypoints: [
      [7.5, 78.0],
      [7.0, 77.5],
      [8.5, 76.0],
    ],
  },

  // ── Mumbai ↔ Kolkata ────────────────────────────────────────────────
  // CROSS-PENINSULA: Full circumnavigation via west coast → cape → east coast → Bay of Bengal
  {
    "source_port": 1,
    "destination_port": 4,
    "traffic_volume": 2800,
    "distance_nm": 1500.0,
    seaWaypoints: [
      ...WEST_COAST,
      ...CAPE_COMORIN,
      ...EAST_COAST,
      ...BAY_OF_BENGAL,
    ],
  },
  {
    "source_port": 4,
    "destination_port": 1,
    "traffic_volume": 3000,
    "distance_nm": 1500.0,
    seaWaypoints: [
      ...rev(BAY_OF_BENGAL),
      ...rev(EAST_COAST),
      ...rev(CAPE_COMORIN),
      ...rev(WEST_COAST),
    ],
  },

  // ── Mundra ↔ Chennai ────────────────────────────────────────────────
  // CROSS-PENINSULA: From Gujarat via Arabian Sea → west coast → cape → east coast
  {
    "source_port": 2,
    "destination_port": 3,
    "traffic_volume": 1800,
    "distance_nm": 1200.0,
    seaWaypoints: [
      ...rev(ARABIAN_SEA),         // South from Mundra along Arabian Sea
      [18.0, 71.5],                // Off Mumbai coast
      ...WEST_COAST,
      ...CAPE_COMORIN,
      ...EAST_COAST.slice(0, 4),
    ],
  },
  {
    "source_port": 3,
    "destination_port": 2,
    "traffic_volume": 2000,
    "distance_nm": 1200.0,
    seaWaypoints: [
      ...rev(EAST_COAST.slice(0, 4)),
      ...rev(CAPE_COMORIN),
      ...rev(WEST_COAST),
      [18.0, 71.5],
      ...ARABIAN_SEA,
    ],
  },

  // ── Vizag ↔ Paradip ─────────────────────────────────────────────────
  // East coast — keep offshore with a waypoint for safety
  {
    "source_port": 6,
    "destination_port": 9,
    "traffic_volume": 1800,
    "distance_nm": 450.0,
    seaWaypoints: [
      [19.0, 85.5],   // Offshore in Bay of Bengal
    ],
  },
  {
    "source_port": 9,
    "destination_port": 6,
    "traffic_volume": 2000,
    "distance_nm": 450.0,
    seaWaypoints: [
      [19.0, 85.5],
    ],
  },

  // ── Vizag ↔ Chennai ─────────────────────────────────────────────────
  // Long east coast — may clip AP coast with Bézier offset
  {
    "source_port": 6,
    "destination_port": 3,
    "traffic_volume": 2000,
    "distance_nm": 600.0,
    seaWaypoints: [
      [15.5, 81.5],   // Off Andhra coast
      [13.5, 81.0],   // Approaching Chennai from offshore
    ],
  },
  {
    "source_port": 3,
    "destination_port": 6,
    "traffic_volume": 2200,
    "distance_nm": 600.0,
    seaWaypoints: [
      [13.5, 81.0],
      [15.5, 81.5],
    ],
  },

  // ── Mundra ↔ Okha ───────────────────────────────────────────────────
  // West Gujarat coast — Bézier OK
  {
    "source_port": 2,
    "destination_port": 25,
    "traffic_volume": 800,
    "distance_nm": 180.0
  },
  {
    "source_port": 25,
    "destination_port": 2,
    "traffic_volume": 750,
    "distance_nm": 180.0
  },
];
