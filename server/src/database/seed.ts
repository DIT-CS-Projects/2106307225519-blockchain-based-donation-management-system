import { db, pool } from '../config/database'
import { env } from '../config/env'
import { campaigns, type NewCampaignRow } from './schema'
import { logger } from '../utils/logger'

// Image URLs verified 2026-07-17 (GET 200 image/jpeg), Unsplash License.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000)

const SEED_CAMPAIGNS: NewCampaignRow[] = [
  {
    title: 'Classrooms for Mwanza Primary',
    description:
      'Mwanza Primary teaches 940 pupils in six classrooms built for half that number. This campaign funds four new classrooms, desks, and ventilation so every child has a seat and a teacher who can reach them. Construction is handled by a licensed local contractor and every disbursement is published to the campaign record.',
    category: 'Education',
    imageUrl: img('1632215861513-130b66fe97f4'),
    targetAmount: 15_000_000,
    raisedAmount: 8_200_000,
    startDate: daysFromNow(-30),
    endDate: daysFromNow(45),
    status: 'active',
    featured: true,
  },
  {
    title: 'A Library for Zanzibar Girls',
    description:
      "Stone Town's girls' secondary school has 1,200 students and no library. We are stocking one: 4,000 books, reading tables, and a librarian's first year of salary. Titles are chosen with the school board and receipts for every order are attached to the record.",
    category: 'Education',
    imageUrl: img('1666281269793-da06484657e8'),
    targetAmount: 6_500_000,
    raisedAmount: 1_750_000,
    startDate: daysFromNow(-14),
    endDate: daysFromNow(60),
    status: 'active',
    featured: false,
  },
  {
    title: 'Clean Water for Kigamboni',
    description:
      'Three boreholes and solar pumps will bring piped water within 400 metres of every household in two Kigamboni wards, replacing a two-hour daily walk. Drilling contracts, pump invoices, and water-committee handover documents are all published as they happen.',
    category: 'Community',
    imageUrl: img('1534641614095-6222aed9bdd6'),
    targetAmount: 12_000_000,
    raisedAmount: 9_600_000,
    startDate: daysFromNow(-45),
    endDate: daysFromNow(7),
    status: 'active',
    featured: true,
  },
  {
    title: 'Mangrove Restoration at Msasani Bay',
    description:
      'Mangroves are the coast’s quiet infrastructure: fish nurseries, storm buffers, carbon stores. With local fishing cooperatives we are replanting 30 hectares at Msasani Bay. That is 75,000 seedlings raised, planted, and monitored by the people who depend on the bay.',
    category: 'Environment',
    imageUrl: img('1651838677683-f642527059c6'),
    targetAmount: 8_000_000,
    raisedAmount: 2_400_000,
    startDate: daysFromNow(-10),
    endDate: daysFromNow(80),
    status: 'active',
    featured: true,
  },
  {
    title: 'Stock the Tandale Market Clinic',
    description:
      'The Tandale ward clinic serves 30,000 residents with a supply cupboard that empties by mid-month. This campaign funds a full year of essential medicines, rapid tests, and cold-chain storage, procured through the national medical stores with every order verifiable.',
    category: 'Health',
    imageUrl: img('1783408355447-b01a88767e6a'),
    targetAmount: 20_000_000,
    raisedAmount: 5_000_000,
    startDate: daysFromNow(-21),
    endDate: daysFromNow(52),
    status: 'active',
    featured: true,
  },
  {
    title: 'Flood-Ready Homes in Jangwani',
    description:
      'When the Msimbazi river rises, Jangwani floods first. We are raising door thresholds, clearing drainage, and pre-positioning sandbags for 400 riverside households before the next long rains. Practical work, done early, fully documented.',
    category: 'Disaster Relief',
    imageUrl: img('1674334264912-704cb2a24b37'),
    targetAmount: 18_000_000,
    raisedAmount: 3_100_000,
    startDate: daysFromNow(-7),
    endDate: daysFromNow(90),
    status: 'active',
    featured: false,
  },
  {
    title: 'Microgrants for Kariakoo Vendors',
    description:
      'Fifty market vendors, most of them women, receive TZS 200,000 microgrants to restock after last season’s market fire. Grants are disbursed directly to each vendor and every payout carries its own verification record. The community exceeded the target, so the surplus funds a second round.',
    category: 'Community',
    imageUrl: img('1734255026082-82fdc81991f0'),
    targetAmount: 10_000_000,
    raisedAmount: 10_450_000,
    startDate: daysFromNow(-60),
    endDate: daysFromNow(21),
    status: 'active',
    featured: true,
  },
]

/** Development seed: replaces all campaigns with a known dataset. */
async function seed() {
  if (env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed a production database.')
  }
  if (!db || !pool) {
    throw new Error('DATABASE_URL is not set. Configure server/.env first.')
  }

  await pool.query('TRUNCATE TABLE campaigns RESTART IDENTITY CASCADE')
  await db.insert(campaigns).values(SEED_CAMPAIGNS)

  logger.info(`Seeded ${SEED_CAMPAIGNS.length} campaigns.`)
  await pool.end()
}

seed().catch((error) => {
  logger.error(error)
  process.exitCode = 1
})
