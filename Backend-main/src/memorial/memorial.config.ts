import { MemorialTribute, MemorialDecoration } from 'src/memorial/interface/memorial.interface';

export const BANNED_SLUGS = [
  'new',
  'edit',
  'delete',
  'admin',
  'login',
  'logout',
  'signup',
  'settings',
  'create',
  'contribute',
  'preview',
  'premium',
  'premium-success',
  'search-results',
];

const TRIBUTE_COUNTS: Record<MemorialTribute, { candles: number; flowers: number }> = {
  [MemorialTribute.DEFAULT]: { candles: 0, flowers: 0 },
  [MemorialTribute.AMETHYST_TRANQUILITY]: { candles: 7, flowers: 4 },
  [MemorialTribute.BLOSSOM_OF_GRACE]: { candles: 8, flowers: 5 },
  [MemorialTribute.CRIMSON_DEVOTION]: { candles: 7, flowers: 6 },
  [MemorialTribute.FLAMES_OF_REMEMBRANCE]: { candles: 8, flowers: 0 },
  [MemorialTribute.FROSTLIGHT_HARMONY]: { candles: 11, flowers: 4 },
  [MemorialTribute.GOLDEN_SERENITY]: { candles: 10, flowers: 8 },
  [MemorialTribute.LUNAR_SERENITY]: { candles: 7, flowers: 4 },
  [MemorialTribute.MIDNIGHT_SERENITY]: { candles: 7, flowers: 10 },
  [MemorialTribute.OCEAN_OF_LIGHT]: { candles: 13, flowers: 0 },
  [MemorialTribute.ROYAL_SUNRISE]: { candles: 0, flowers: 11 },
  [MemorialTribute.CELESTIAL_BLOOM]: { candles: 9, flowers: 6 },
  [MemorialTribute.MIDNIGHT_ELEGY]: { candles: 0, flowers: 17 },
};

const DECORATION_COUNTS: Record<MemorialDecoration, { candles: number; flowers: number }> = {
  [MemorialDecoration.AMETHERA_ROSE]: { candles: 0, flowers: 1 },
  [MemorialDecoration.AMETHYST_RAVEL]: { candles: 0, flowers: 1 },
  [MemorialDecoration.AURELIA_BLOOM]: { candles: 0, flowers: 1 },
  [MemorialDecoration.AZURE_PEONIA]: { candles: 0, flowers: 1 },
  [MemorialDecoration.CELESTIA_LILY]: { candles: 0, flowers: 1 },
  [MemorialDecoration.CIRCLE_OF_SERENITY]: { candles: 6, flowers: 0 },
  [MemorialDecoration.CORALIA_HIBISCUS]: { candles: 0, flowers: 1 },
  [MemorialDecoration.FROSTARIA_BLOOM]: { candles: 0, flowers: 1 },
  [MemorialDecoration.GOLDEN_REVERIE]: { candles: 0, flowers: 2 },
  [MemorialDecoration.IVORY_WHISPER]: { candles: 0, flowers: 1 },
  [MemorialDecoration.LUNARIA_LILY]: { candles: 0, flowers: 1 },
  [MemorialDecoration.NOCTURNE_CALLA]: { candles: 0, flowers: 1 },
  [MemorialDecoration.ROSALIA_PEONY]: { candles: 0, flowers: 1 },
  [MemorialDecoration.SERAPHINE_CALLA]: { candles: 0, flowers: 1 },
  [MemorialDecoration.SOLARIA_BLOOM]: { candles: 0, flowers: 1 },
  [MemorialDecoration.SOLARIS_HIBISCUS]: { candles: 0, flowers: 1 },
  [MemorialDecoration.SONATA_BLOOM]: { candles: 0, flowers: 1 },
  [MemorialDecoration.TRINITY_OF_LIGHT]: { candles: 3, flowers: 0 },
  [MemorialDecoration.VELORIA_LISIANTHUS]: { candles: 0, flowers: 3 },
};

/** Postgres enum type names */
const PG_TRIBUTE_ENUM = 'memorial_tribute_v2';
const PG_DECORATION_ENUM = 'memorial_decoration_new';

/** Database column names */
const COLUMNS = {
  // Memorial table
  MEMORIAL_TRIBUTE: 'tribute_v2',

  // Memory table
  MEMORY_DECORATION: 'decoration_new',
  MEMORY_ASSET_DECORATION: 'asset_decoration_v2',
  MEMORY_STATUS: 'status',
  MEMORY_OWNER_ID: 'owner_id',
  MEMORY_MEMORIAL_ID: 'memorial_id',

  // Condolence table
  CONDOLENCE_DECORATION: 'decoration_new',
  CONDOLENCE_STATUS: 'status',
  CONDOLENCE_OWNER_ID: 'owner_id',
  CONDOLENCE_MEMORIAL_ID: 'memorial_id',

  // Donation table
  DONATION_OWNER_ID: 'owner_id',
  DONATION_MEMORIAL_ID: 'memorial_id',
  DONATION_STATUS: 'status',
  DONATION_ITEM_COUNT: 'item_count',
  DONATION_VALUE_IN_CENTS: 'value_in_cents',

  // Status values
  STATUS_PUBLISHED: 'published',
} as const;

/** Build VALUES(...) typed to a Postgres enum */
function buildValuesForEnum<T extends string, V extends { candles: number; flowers: number }>(
  map: Record<T, V>,
  pgEnumType: string,
): string {
  return (Object.entries(map) as [T, V][])
    .map(([key, v]) => `('${key}'::${pgEnumType}, ${v.candles}, ${v.flowers})`)
    .join(',\n        ');
}

/** Internal: build the SQL fragment for candles/flowers count
 *  Now sums memorial.tribute + SUM(memory.decoration + memory.tribute)
 */
function getCountQuery(alias: string, field: 'candles' | 'flowers'): string {
  const tributeValues = buildValuesForEnum(TRIBUTE_COUNTS, PG_TRIBUTE_ENUM);
  const decorationValues = buildValuesForEnum(DECORATION_COUNTS, PG_DECORATION_ENUM);

  return `
  (
    /* memorial.tribute (only for premium memorials) */
    COALESCE((
      SELECT t.${field}
      FROM (VALUES
        ${tributeValues}
      ) AS t(key, candles, flowers)
      WHERE t.key = ${alias}.${COLUMNS.MEMORIAL_TRIBUTE}
        AND ${alias}.is_premium = true
    ), 0)
    +
    /* published memories: decoration + (optional) asset_decoration */
    COALESCE((
      SELECT COALESCE(SUM(
        COALESCE(dv.${field}, 0) + COALESCE(tv.${field}, 0)
      ), 0)
      FROM memory m
      LEFT JOIN (VALUES
        ${decorationValues}
      ) AS dv(key, candles, flowers) ON dv.key = m.${COLUMNS.MEMORY_DECORATION}
      LEFT JOIN (VALUES
        ${tributeValues}
      ) AS tv(key, candles, flowers) ON tv.key = m.${COLUMNS.MEMORY_ASSET_DECORATION}
      WHERE m.${COLUMNS.MEMORY_MEMORIAL_ID} = ${alias}.id
        AND m.${COLUMNS.MEMORY_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
    ), 0)
    +
    /* published condolences: decoration ONLY (no asset_decoration) */
    COALESCE((
      SELECT COALESCE(SUM(
        COALESCE(dv.${field}, 0)
      ), 0)
      FROM condolence c
      LEFT JOIN (VALUES
        ${decorationValues}
      ) AS dv(key, candles, flowers) ON dv.key = c.${COLUMNS.CONDOLENCE_DECORATION}
      WHERE c.${COLUMNS.CONDOLENCE_MEMORIAL_ID} = ${alias}.id
        AND c.${COLUMNS.CONDOLENCE_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
    ), 0)
  )`;
}

/** Public helpers */
export function getFlowersCountQuery(alias: string): string {
  return getCountQuery(alias, 'flowers');
}

export function getCandlesCountQuery(alias: string): string {
  return getCountQuery(alias, 'candles');
}

/** Build SQL VALUES clause for tribute flower counts only */
function buildTributeFlowerValues(): string {
  return (
    Object.entries(TRIBUTE_COUNTS) as [MemorialTribute, { candles: number; flowers: number }][]
  )
    .map(([key, v]) => `('${key}'::${PG_TRIBUTE_ENUM}, ${v.flowers})`)
    .join(',\n        ');
}

/** Build SQL VALUES clause for decoration flower counts only */
function buildDecorationFlowerValues(): string {
  return (
    Object.entries(DECORATION_COUNTS) as [
      MemorialDecoration,
      { candles: number; flowers: number },
    ][]
  )
    .map(([key, v]) => `('${key}'::${PG_DECORATION_ENUM}, ${v.flowers})`)
    .join(',\n        ');
}

/** Build SQL VALUES clause for tribute candle counts only */
function buildTributeCandleValues(): string {
  return (
    Object.entries(TRIBUTE_COUNTS) as [MemorialTribute, { candles: number; flowers: number }][]
  )
    .map(([key, v]) => `('${key}'::${PG_TRIBUTE_ENUM}, ${v.candles})`)
    .join(',\n        ');
}

/** Build SQL VALUES clause for decoration candle counts only */
function buildDecorationCandleValues(): string {
  return (
    Object.entries(DECORATION_COUNTS) as [
      MemorialDecoration,
      { candles: number; flowers: number },
    ][]
  )
    .map(([key, v]) => `('${key}'::${PG_DECORATION_ENUM}, ${v.candles})`)
    .join(',\n        ');
}

/** Build query to get top flower contributors for a memorial */
export function getTopFlowerContributorsQuery(): string {
  const tributeValues = buildTributeFlowerValues();
  const decorationValues = buildDecorationFlowerValues();

  return `
    WITH user_flowers AS (
      -- Flowers from memories (decoration + asset_decoration)
      SELECT
        m.${COLUMNS.MEMORY_OWNER_ID} as user_id,
        COALESCE(SUM(
          COALESCE(dv.flowers, 0) + COALESCE(tv.flowers, 0)
        ), 0) as flower_count
      FROM memory m
      LEFT JOIN (VALUES
        ${decorationValues}
      ) AS dv(key, flowers) ON dv.key = m.${COLUMNS.MEMORY_DECORATION}
      LEFT JOIN (VALUES
        ${tributeValues}
      ) AS tv(key, flowers) ON tv.key = m.${COLUMNS.MEMORY_ASSET_DECORATION}
      WHERE m.${COLUMNS.MEMORY_MEMORIAL_ID} = $1
        AND m.${COLUMNS.MEMORY_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
      GROUP BY m.${COLUMNS.MEMORY_OWNER_ID}

      UNION ALL

      -- Flowers from condolences (decoration only)
      SELECT
        c.${COLUMNS.CONDOLENCE_OWNER_ID} as user_id,
        COALESCE(SUM(COALESCE(dv.flowers, 0)), 0) as flower_count
      FROM condolence c
      LEFT JOIN (VALUES
        ${decorationValues}
      ) AS dv(key, flowers) ON dv.key = c.${COLUMNS.CONDOLENCE_DECORATION}
      WHERE c.${COLUMNS.CONDOLENCE_MEMORIAL_ID} = $1
        AND c.${COLUMNS.CONDOLENCE_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
      GROUP BY c.${COLUMNS.CONDOLENCE_OWNER_ID}

      UNION ALL

      -- Flowers from memorial's own tribute (only for premium memorials)
      SELECT
        mem.owner_id as user_id,
        COALESCE(tv.flowers, 0) as flower_count
      FROM memorial mem
      LEFT JOIN (VALUES
        ${tributeValues}
      ) AS tv(key, flowers) ON tv.key = mem.${COLUMNS.MEMORIAL_TRIBUTE}
      WHERE mem.id = $1
        AND mem.${COLUMNS.MEMORIAL_TRIBUTE} IS NOT NULL
        AND mem.is_premium = true
    ),
    aggregated AS (
      SELECT
        user_id,
        SUM(flower_count) as total_flowers
      FROM user_flowers
      GROUP BY user_id
      HAVING SUM(flower_count) > 0
    )
    SELECT
      a.user_id as "userId",
      u.display_name as name,
      a.total_flowers as amount
    FROM aggregated a
    JOIN "user" u ON u.user_id = a.user_id
    ORDER BY a.total_flowers DESC, a.user_id ASC
  `;
}

/** Build query to get top candle contributors for a memorial */
export function getTopCandleContributorsQuery(): string {
  const tributeValues = buildTributeCandleValues();
  const decorationValues = buildDecorationCandleValues();

  return `
    WITH user_candles AS (
      -- Candles from memories (decoration + asset_decoration)
      SELECT
        m.${COLUMNS.MEMORY_OWNER_ID} as user_id,
        COALESCE(SUM(
          COALESCE(dv.candles, 0) + COALESCE(tv.candles, 0)
        ), 0) as candle_count
      FROM memory m
      LEFT JOIN (VALUES
        ${decorationValues}
      ) AS dv(key, candles) ON dv.key = m.${COLUMNS.MEMORY_DECORATION}
      LEFT JOIN (VALUES
        ${tributeValues}
      ) AS tv(key, candles) ON tv.key = m.${COLUMNS.MEMORY_ASSET_DECORATION}
      WHERE m.${COLUMNS.MEMORY_MEMORIAL_ID} = $1
        AND m.${COLUMNS.MEMORY_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
      GROUP BY m.${COLUMNS.MEMORY_OWNER_ID}

      UNION ALL

      -- Candles from condolences (decoration only)
      SELECT
        c.${COLUMNS.CONDOLENCE_OWNER_ID} as user_id,
        COALESCE(SUM(COALESCE(dv.candles, 0)), 0) as candle_count
      FROM condolence c
      LEFT JOIN (VALUES
        ${decorationValues}
      ) AS dv(key, candles) ON dv.key = c.${COLUMNS.CONDOLENCE_DECORATION}
      WHERE c.${COLUMNS.CONDOLENCE_MEMORIAL_ID} = $1
        AND c.${COLUMNS.CONDOLENCE_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
      GROUP BY c.${COLUMNS.CONDOLENCE_OWNER_ID}

      UNION ALL

      -- Candles from memorial's own tribute (only for premium memorials)
      SELECT
        mem.owner_id as user_id,
        COALESCE(tv.candles, 0) as candle_count
      FROM memorial mem
      LEFT JOIN (VALUES
        ${tributeValues}
      ) AS tv(key, candles) ON tv.key = mem.${COLUMNS.MEMORIAL_TRIBUTE}
      WHERE mem.id = $1
        AND mem.${COLUMNS.MEMORIAL_TRIBUTE} IS NOT NULL
        AND mem.is_premium = true
    ),
    aggregated AS (
      SELECT
        user_id,
        SUM(candle_count) as total_candles
      FROM user_candles
      GROUP BY user_id
      HAVING SUM(candle_count) > 0
    )
    SELECT
      a.user_id as "userId",
      u.display_name as name,
      a.total_candles as amount
    FROM aggregated a
    JOIN "user" u ON u.user_id = a.user_id
    ORDER BY a.total_candles DESC, a.user_id ASC
  `;
}

/** Build query to get top tree planters (by item count) for a memorial */
export function getTopTreePlantersQuery(): string {
  return `
    SELECT
      d.${COLUMNS.DONATION_OWNER_ID} as "userId",
      u.display_name as name,
      COALESCE(SUM(d.${COLUMNS.DONATION_ITEM_COUNT}), 0) as amount
    FROM donation d
    JOIN "user" u ON u.user_id = d.${COLUMNS.DONATION_OWNER_ID}
    WHERE d.${COLUMNS.DONATION_MEMORIAL_ID} = $1
      AND d.${COLUMNS.DONATION_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
    GROUP BY d.${COLUMNS.DONATION_OWNER_ID}, u.display_name
    HAVING SUM(d.${COLUMNS.DONATION_ITEM_COUNT}) > 0
    ORDER BY amount DESC, "userId" ASC
  `;
}

/** Build query to get top donors (by value in cents) for a memorial */
export function getTopDonorsQuery(): string {
  return `
    SELECT
      d.${COLUMNS.DONATION_OWNER_ID} as "userId",
      u.display_name as name,
      COALESCE(SUM(d.${COLUMNS.DONATION_VALUE_IN_CENTS}), 0) as amount
    FROM donation d
    JOIN "user" u ON u.user_id = d.${COLUMNS.DONATION_OWNER_ID}
    WHERE d.${COLUMNS.DONATION_MEMORIAL_ID} = $1
      AND d.${COLUMNS.DONATION_STATUS} = '${COLUMNS.STATUS_PUBLISHED}'
    GROUP BY d.${COLUMNS.DONATION_OWNER_ID}, u.display_name
    HAVING SUM(d.${COLUMNS.DONATION_VALUE_IN_CENTS}) > 0
    ORDER BY amount DESC, "userId" ASC
  `;
}
