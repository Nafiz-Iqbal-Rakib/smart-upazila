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
      member.nid = member.nid || s.nid;
      member.address = member.address || s.address;
      member.passwordHash = await bcrypt.hash(s.pass, 10);
      member.isApproved = true;
      member.isActive = true;
      await userRepo.save(member);
      console.log(`✅ Staff updated: ${s.name} (${s.phone})`);
    }
  }

  // 2. 🚨 Emergency contacts
  if ((await emergencyRepo.count()) === 0) {
    await emergencyRepo.save([
      emergencyRepo.create({ serviceName: 'জাতীয় জরুরি সেবা', category: 'Emergency', phoneNumber: '999', address: 'সারাদেশ' }),
      emergencyRepo.create({ serviceName: 'পুলিশ কন্ট্রোল রুম', category: 'Police', phoneNumber: '999', address: 'সারাদেশ' }),
      emergencyRepo.create({ serviceName: 'ফায়ার সার্ভিস স্টেশন', category: 'Fire', phoneNumber: '999', address: 'সারাদেশ' }),
      emergencyRepo.create({ serviceName: 'উপজেলা স্বাস্থ্য কমপ্লেক্স', category: 'Hospital', phoneNumber: '০৫২১-৬১২৩৪', address: 'সদর রোড, উপজেলা' }),
      emergencyRepo.create({ serviceName: 'উপজেলা নির্বাহী অফিসারের কার্যালয়', category: 'Administration', phoneNumber: '০৫২১-৬২৩৪৫', address: 'উপজেলা পরিষদ' }),
    ]);
    console.log('✅ Emergency contacts seeded.');
  }

  // 3. 🩸 Blood donors
  if ((await donorRepo.count()) === 0) {
    await donorRepo.save([
      donorRepo.create({ name: 'রফিকুল ইসলাম', bloodGroup: BloodGroup.O_POS, phoneNumber: '01811111111', address: 'বাজার রোড, সদর', isAvailable: true }),
      donorRepo.create({ name: 'সুমাইয়া আক্তার', bloodGroup: BloodGroup.A_NEG, phoneNumber: '01922222222', address: 'কলেজ পাড়া', isAvailable: true }),
    ]);
    console.log('✅ Blood donors seeded.');
  }

  // 4. 🍲 Foods
  if ((await foodRepo.count()) === 0) {
    await foodRepo.save([
      foodRepo.create({ name: 'পোড়াবাড়ির চমচম', description: 'ঐতিহ্যবাহী দোকানের স্পেশাল মিষ্টি', category: 'মিষ্টি', isAreaSpecial: true, priceRange: '৫০-১০০ টাকা', address: 'পুরান বাজার' }),
      foodRepo.create({ name: 'ভুনা খিচুড়ি', description: 'স্থানীয় দোকানের জনপ্রিয় খিচুড়ি', category: 'ভাতের খাবার', priceRange: '৬০-১২০ টাকা', address: 'স্টেশন রোড' }),
    ]);
    console.log('✅ Foods seeded.');
  }

  // 5. 🏛️ Places
  if ((await placeRepo.count()) === 0) {
    await placeRepo.save([
      placeRepo.create({ name: 'ঐতিহাসিক জমিদার বাড়ি', description: 'প্রাচীন প্রত্নতাত্ত্বিক নিদর্শন ও রাজপ্রাসাদ', category: PlaceCategory.HISTORICAL, address: 'মহেড়া, উপজেলা সদর', entryFee: 'মুক্ত', openingHours: 'সকাল ৯টা - সন্ধ্যা ৬টা' }),
      placeRepo.create({ name: 'নদীর ঘাট ও পার্ক', description: 'বিকালে ঘুরতে যাওয়ার জন্য সুন্দর মনোরম জায়গা', category: PlaceCategory.TOURIST_SPOT, address: 'নদীর পাড়' }),
    ]);
    console.log('✅ Places seeded.');
  }

  // 6. 🏫 Community
  if ((await communityRepo.count()) === 0) {
    await communityRepo.save([
      communityRepo.create({ name: 'উপজেলা সরকারি মডেল উচ্চ বিদ্যালয়', type: ListingType.SCHOOL, address: 'শহীদ মিনার রোড' }),
      communityRepo.create({ name: 'সরকারি মহিলা কলেজ', type: ListingType.COLLEGE, address: 'কলেজ গেট' }),
      communityRepo.create({ name: 'স্থানীয় পাবলিক লাইব্রেরি', type: ListingType.FACILITY, address: 'নতুন বাজার' }),
    ]);
    console.log('✅ Community listings seeded.');
  }

  // 7. 📢 Notices
  if ((await noticeRepo.count()) === 0) {
    await noticeRepo.save([
      noticeRepo.create({
        title: 'লাইন সংস্কারের জন্য আগামী শনিবার সাময়িক বিদ্যুৎ বিভ্রাট',
        content: 'উপজেলা কেন্দ্রীয় ৩৩/১১ কেভি সাব-স্টেশনের জরুরি রক্ষণাবেক্ষণ কাজের জন্য আগামী শনিবার সকাল ৮টা থেকে দুপুর ১টা পর্যন্ত সদর ও বাজার এলাকায় বিদ্যুৎ সরবরাহ বন্ধ থাকবে।',
        category: NoticeCategory.ELECTRICITY,
        priority: NoticePriority.URGENT,
        createdBy: admin,
      }),
      noticeRepo.create({
        title: 'উপজেলা স্বাস্থ্য কমপ্লেক্সে বিনামূল্যে চক্ষু ও ডায়াবেটিস ক্যাম্পেইন',
        content: 'আগামী সোমবার সকাল ৯টা থেকে উপজেলা স্বাস্থ্য কমপ্লেক্স প্রাঙ্গণে বিশেষজ্ঞ ডাক্তার দ্বারা বিনামূল্যে চিকিৎসা সেবা ও ওষুধ বিতরণ করা হবে।',
        category: NoticeCategory.HEALTH,
        priority: NoticePriority.NORMAL,
        createdBy: admin,
      }),
      noticeRepo.create({
        title: 'চলতি মৌসুমে রবি শস্যের প্রণোদনার সার ও বীজ বিতরণ বিজ্ঞপ্তি',
        content: 'উপজেলা কৃষি সম্প্রসারণ অধিদপ্তরের উদ্যোগে ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে রবি শস্যের সার ও বীজ বিতরণ শুরু হয়েছে। সংশ্লিষ্ট ইউনিয়ন পরিষদ থেকে তালিকা সংগ্রহ করুন।',
        category: NoticeCategory.AGRICULTURE,
        priority: NoticePriority.NORMAL,
        createdBy: admin,
      }),
    ]);
    console.log('✅ Notices seeded.');
  }

  console.log('🎉 Seed complete!');
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
