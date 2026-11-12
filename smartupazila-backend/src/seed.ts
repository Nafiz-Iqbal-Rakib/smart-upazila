import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department, Role, User } from './users/user.entity';
import { Complaint } from './complaints/complaint.entity';
import { EmergencyContact } from './emergency/emergency-contact.entity';
import { BloodDonor, BloodGroup } from './blood-donors/blood-donor.entity';
import { Food } from './foods/food.entity';
import { Place, PlaceCategory } from './places/place.entity';
import { CommunityListing, ListingType } from './community/community-listing.entity';
import { Notice, NoticeCategory, NoticePriority } from './notices/notice.entity';

const databaseUrl = process.env.DATABASE_URL;
const useSsl =
  process.env.DB_SSL === 'true' ||
  Boolean(
    databaseUrl &&
      (databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require')),
  );

const dataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'smartupazila_db',
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Complaint,
    EmergencyContact,
    BloodDonor,
    Food,
    Place,
    CommunityListing,
    Notice,
  ],
  synchronize: true,
});

async function seed() {
  console.log('🌱 Connecting to database for seeding...');
  await dataSource.initialize();
  console.log('✅ Database connected.');

  const userRepo = dataSource.getRepository(User);
  const emergencyRepo = dataSource.getRepository(EmergencyContact);
  const donorRepo = dataSource.getRepository(BloodDonor);
  const foodRepo = dataSource.getRepository(Food);
  const placeRepo = dataSource.getRepository(Place);
  const communityRepo = dataSource.getRepository(CommunityListing);
  const noticeRepo = dataSource.getRepository(Notice);

  // 1. 👑 Admin user (approve করা)
  let admin = await userRepo.findOneBy({ phoneNumber: '01700000000' });
  if (!admin) {
    await userRepo.save(
      userRepo.create({
        name: 'Upazila Admin',
        phoneNumber: '01700000000',
        email: 'admin@upazila.gov.bd',
        nid: '1985000000001',
        address: 'উপজেলা পরিষদ ভবন',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN,
        isApproved: true,
        isActive: true,
      }),
    );
    console.log('✅ Admin → phone: 01700000000 / password: admin123');
  } else {
    admin.email = admin.email || 'admin@upazila.gov.bd';
    admin.nid = admin.nid || '1985000000001';
    admin.address = admin.address || 'উপজেলা পরিষদ ভবন';
    admin.isApproved = true;
    admin.isActive = true;
    await userRepo.save(admin);
    console.log('✅ Admin (existing) verified: 01700000000');
  }

  // Approved Citizen user for tests
  let citizen = await userRepo.findOneBy({ phoneNumber: '01800000002' });
  if (!citizen) {
    await userRepo.save(
      userRepo.create({
        name: 'রাশেদ খান (Citizen)',
        phoneNumber: '01800000002',
        email: 'citizen@example.com',
        nid: '1995000000002',
        address: 'সদর রোড, ওয়ার্ড ৩',
        passwordHash: await bcrypt.hash('citizen123', 10),
        role: Role.CITIZEN,
        isApproved: true,
        isActive: true,
      }),
    );
    console.log('✅ Citizen → phone: 01800000002 / password: citizen123');
  } else {
    citizen.email = citizen.email || 'citizen@example.com';
    citizen.nid = citizen.nid || '1995000000002';
    citizen.address = citizen.address || 'সদর রোড, ওয়ার্ড ৩';
    citizen.isApproved = true;
    citizen.isActive = true;
    await userRepo.save(citizen);
  }

  // Staff members (Officers with departments + Moderator)
  const staff: { name: string; phone: string; pass: string; role: Role; department?: Department; email: string; nid: string; address: string }[] = [
    { name: 'সড়ক ও জনপথ কর্মকর্তা', phone: '01700000001', pass: 'officer123', role: Role.OFFICER, department: Department.ROAD, email: 'road@upazila.gov.bd', nid: '1987000000003', address: 'সড়ক ও জনপথ উপ-বিভাগ' },
    { name: 'উপজেলা স্বাস্থ্য কর্মকর্তা', phone: '01700000003', pass: 'health123', role: Role.OFFICER, department: Department.HEALTH, email: 'health@upazila.gov.bd', nid: '1989000000004', address: 'উপজেলা স্বাস্থ্য কমপ্লেক্স' },
    { name: 'কন্টেন্ট মডারেটর', phone: '01700000002', pass: 'moderator123', role: Role.MODERATOR, email: 'moderator@upazila.gov.bd', nid: '1992000000005', address: 'উপজেলা আইসিটি সেল' },
  ];

  for (const s of staff) {
    let member = await userRepo.findOneBy({ phoneNumber: s.phone });
    if (!member) {
      await userRepo.save(
        userRepo.create({
          name: s.name,
          phoneNumber: s.phone,
          email: s.email,
          nid: s.nid,
          address: s.address,
          passwordHash: await bcrypt.hash(s.pass, 10),
          role: s.role,
          department: s.department || null,
          isApproved: true,
          isActive: true,
        }),
      );
      console.log(`✅ Staff created: ${s.name} (${s.phone})`);
    } else {
      member.name = s.name;
      member.role = s.role;
      member.department = s.department || null;
      member.email = member.email || s.email;
