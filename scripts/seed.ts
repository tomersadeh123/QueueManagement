import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Create a sample business
    console.log('📍 Creating sample business...');
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: 'Style & Cut Salon',
        phone: '+972-50-1234567',
        address: 'Tel Aviv, Israel',
        settings: {
          work_hours: {
            sunday: { start: '09:00', end: '19:00' },
            monday: { start: '09:00', end: '19:00' },
            tuesday: { start: '09:00', end: '19:00' },
            wednesday: { start: '09:00', end: '19:00' },
            thursday: { start: '09:00', end: '19:00' },
            friday: { start: '09:00', end: '15:00' },
            saturday: { closed: true },
          },
        },
      })
      .select()
      .single();

    if (businessError) throw businessError;
    console.log(`✅ Business created: ${business.name} (ID: ${business.id})\n`);

    // 2. Create staff members
    console.log('👥 Creating staff members...');
    const staffData = [
      { name: 'Sarah Cohen', phone: '+972-50-1111111' },
      { name: 'David Levi', phone: '+972-50-2222222' },
      { name: 'Maya Friedman', phone: '+972-50-3333333' },
    ];

    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert(
        staffData.map((s) => ({
          business_id: business.id,
          name: s.name,
          phone: s.phone,
          working_hours: {
            sunday: { start: '09:00', end: '19:00' },
            monday: { start: '09:00', end: '19:00' },
            tuesday: { start: '09:00', end: '19:00' },
            wednesday: { start: '09:00', end: '19:00' },
            thursday: { start: '09:00', end: '19:00' },
            friday: { start: '09:00', end: '15:00' },
          },
          is_active: true,
        }))
      )
      .select();

    if (staffError) throw staffError;
    staff.forEach((s) => console.log(`  ✅ ${s.name}`));
    console.log();

    // 3. Create services
    console.log('✂️ Creating services...');
    const servicesData = [
      { name: 'Haircut - Men', duration: 30, price: 80 },
      { name: 'Haircut - Women', duration: 45, price: 150 },
      { name: 'Hair Coloring', duration: 90, price: 350 },
      { name: 'Beard Trim', duration: 15, price: 40 },
      { name: 'Hair Styling', duration: 30, price: 100 },
      { name: 'Hair Treatment', duration: 60, price: 200 },
    ];

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .insert(
        servicesData.map((s) => ({
          business_id: business.id,
          name: s.name,
          duration_minutes: s.duration,
          price: s.price,
          is_active: true,
        }))
      )
      .select();

    if (servicesError) throw servicesError;
    services.forEach((s) => console.log(`  ✅ ${s.name} (₪${s.price}, ${s.duration_minutes}min)`));
    console.log();

    // 4. Link services to staff
    console.log('🔗 Linking services to staff...');
    const staffServices = [];
    for (const staffMember of staff) {
      for (const service of services) {
        staffServices.push({
          staff_id: staffMember.id,
          service_id: service.id,
        });
      }
    }

    const { error: linkError } = await supabase.from('staff_services').insert(staffServices);
    if (linkError) throw linkError;
    console.log(`  ✅ Linked ${staffServices.length} staff-service relationships\n`);

    // 5. Create sample appointments (upcoming)
    console.log('📅 Creating sample appointments...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointmentsData = [
      {
        customer_name: 'Yael Shapiro',
        customer_phone: '+972-50-9991111',
        appointment_time: tomorrow.toISOString(),
        status: 'confirmed',
      },
      {
        customer_name: 'Avi Ben-David',
        customer_phone: '+972-50-9992222',
        appointment_time: new Date(tomorrow.getTime() + 45 * 60000).toISOString(),
        status: 'confirmed',
      },
    ];

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(
        appointmentsData.map((a, i) => ({
          business_id: business.id,
          customer_name: a.customer_name,
          customer_phone: a.customer_phone,
          service_id: services[i % services.length].id,
          staff_id: staff[i % staff.length].id,
          appointment_time: a.appointment_time,
          status: a.status,
        }))
      )
      .select();

    if (appointmentsError) throw appointmentsError;
    appointments.forEach((a) => console.log(`  ✅ ${a.customer_name} at ${new Date(a.appointment_time).toLocaleString()}`));
    console.log();

    // 6. Create sample queue entries
    console.log('🎫 Creating sample queue entries...');
    const queueData = [
      { customer_name: 'Chen Mizrahi', customer_phone: '+972-50-8881111', queue_number: 1, status: 'in_progress' },
      { customer_name: 'Tal Katz', customer_phone: '+972-50-8882222', queue_number: 2, status: 'waiting' },
      { customer_name: 'Noa Schwartz', customer_phone: '+972-50-8883333', queue_number: 3, status: 'waiting' },
    ];

    const { data: queue, error: queueError } = await supabase
      .from('queue_entries')
      .insert(
        queueData.map((q) => ({
          business_id: business.id,
          customer_name: q.customer_name,
          customer_phone: q.customer_phone,
          service_id: services[0].id,
          queue_number: q.queue_number,
          status: q.status,
          estimated_wait_minutes: (q.queue_number - 1) * 30,
        }))
      )
      .select();

    if (queueError) throw queueError;
    queue.forEach((q) => console.log(`  ✅ #${q.queue_number} - ${q.customer_name} (${q.status})`));
    console.log();

    console.log('✨ Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - 1 business created`);
    console.log(`   - ${staff.length} staff members`);
    console.log(`   - ${services.length} services`);
    console.log(`   - ${appointments.length} appointments`);
    console.log(`   - ${queue.length} queue entries`);
    console.log(`\n🚀 You can now test the app with this data!`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
