import * as React from 'react';

type AppointmentEmailProps = {
  customerName: string;
  businessName: string;
  serviceName: string;
  appointmentTime: string;
  appointmentDate: string;
  businessPhone: string;
  businessAddress?: string;
};

export function AppointmentConfirmationEmail({
  customerName,
  businessName,
  serviceName,
  appointmentTime,
  appointmentDate,
  businessPhone,
  businessAddress,
}: AppointmentEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '30px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
        <h1 style={{ margin: '0', fontSize: '28px' }}>✅ Appointment Confirmed!</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: '0.9' }}>תור אושר!</p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '30px', borderRadius: '0 0 8px 8px' }}>
        <p style={{ fontSize: '18px', color: '#1f2937', marginTop: '0' }}>
          Hi {customerName},
        </p>
        <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
          Your appointment has been confirmed! Here are your details:
        </p>

        <div style={{ backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: '8px', padding: '20px', margin: '20px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>📅 Date:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {appointmentDate}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>🕐 Time:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {appointmentTime}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>✂️ Service:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {serviceName}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>🏢 Location:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {businessName}
              </td>
            </tr>
          </table>
        </div>

        {businessAddress && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '15px 0' }}>
            📍 <strong>Address:</strong> {businessAddress}
          </p>
        )}

        <p style={{ fontSize: '14px', color: '#6b7280', margin: '15px 0' }}>
          📞 <strong>Contact:</strong> {businessPhone}
        </p>

        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px', padding: '15px', margin: '20px 0' }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
            ⏰ <strong>Please arrive 5-10 minutes early</strong>
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          If you need to cancel or reschedule, please call us at {businessPhone} as soon as possible.
        </p>

        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0' }}>
          We look forward to seeing you!<br />
          {businessName}
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '12px' }}>
        <p style={{ margin: '0' }}>Powered by Salon Queue Management</p>
      </div>
    </div>
  );
}

export function AppointmentReminderEmail({
  customerName,
  businessName,
  serviceName,
  appointmentTime,
  appointmentDate,
  businessPhone,
  businessAddress,
}: AppointmentEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '30px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
        <h1 style={{ margin: '0', fontSize: '28px' }}>🔔 Appointment Reminder</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: '0.9' }}>תזכורת לתור</p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '30px', borderRadius: '0 0 8px 8px' }}>
        <p style={{ fontSize: '18px', color: '#1f2937', marginTop: '0' }}>
          Hi {customerName},
        </p>
        <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
          This is a friendly reminder about your upcoming appointment:
        </p>

        <div style={{ backgroundColor: 'white', border: '2px solid #f59e0b', borderRadius: '8px', padding: '20px', margin: '20px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>📅 Date:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {appointmentDate}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>🕐 Time:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {appointmentTime}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>✂️ Service:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {serviceName}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#6b7280', fontSize: '14px' }}>🏢 Location:</td>
              <td style={{ padding: '10px 0', color: '#1f2937', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
                {businessName}
              </td>
            </tr>
          </table>
        </div>

        {businessAddress && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '15px 0' }}>
            📍 <strong>Address:</strong> {businessAddress}
          </p>
        )}

        <p style={{ fontSize: '14px', color: '#6b7280', margin: '15px 0' }}>
          📞 <strong>Contact:</strong> {businessPhone}
        </p>

        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px', padding: '15px', margin: '20px 0' }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
            ⏰ <strong>Please arrive 5-10 minutes early</strong>
          </p>
        </div>

        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px', padding: '15px', margin: '20px 0' }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#991b1b' }}>
            ⚠️ <strong>Need to cancel?</strong> Please call us at {businessPhone} as soon as possible.
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0' }}>
          We look forward to seeing you tomorrow!<br />
          {businessName}
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '12px' }}>
        <p style={{ margin: '0' }}>Powered by Salon Queue Management</p>
      </div>
    </div>
  );
}
