type AppointmentEmailProps = {
  customerName: string;
  businessName: string;
  serviceName: string;
  appointmentTime: string;
  appointmentDate: string;
  businessPhone: string;
  businessAddress?: string;
};

export function getConfirmationEmailHtml({
  customerName,
  businessName,
  serviceName,
  appointmentTime,
  appointmentDate,
  businessPhone,
  businessAddress,
}: AppointmentEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto;">
          <tr>
            <td style="background-color: #3b82f6; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">תור אושר!</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 18px; color: #1f2937; margin-top: 0;">
                Hi ${customerName},
              </p>
              <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                Your appointment has been confirmed! Here are your details:
              </p>

              <table style="width: 100%; background-color: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;" cellpadding="10">
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">📅 Date:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">🕐 Time:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${appointmentTime}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">✂️ Service:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">🏢 Location:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${businessName}</td>
                </tr>
              </table>

              ${businessAddress ? `
                <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
                  📍 <strong>Address:</strong> ${businessAddress}
                </p>
              ` : ''}

              <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
                📞 <strong>Contact:</strong> ${businessPhone}
              </p>

              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  ⏰ <strong>Please arrive 5-10 minutes early</strong>
                </p>
              </div>

              <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                If you need to cancel or reschedule, please call us at ${businessPhone} as soon as possible.
              </p>

              <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                We look forward to seeing you!<br>
                ${businessName}
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">Powered by Salon Queue Management</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getReminderEmailHtml({
  customerName,
  businessName,
  serviceName,
  appointmentTime,
  appointmentDate,
  businessPhone,
  businessAddress,
}: AppointmentEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto;">
          <tr>
            <td style="background-color: #f59e0b; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🔔 Appointment Reminder</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">תזכורת לתור</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 18px; color: #1f2937; margin-top: 0;">
                Hi ${customerName},
              </p>
              <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                This is a friendly reminder about your upcoming appointment:
              </p>

              <table style="width: 100%; background-color: white; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;" cellpadding="10">
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">📅 Date:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">🕐 Time:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${appointmentTime}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">✂️ Service:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px;">🏢 Location:</td>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; text-align: right;">${businessName}</td>
                </tr>
              </table>

              ${businessAddress ? `
                <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
                  📍 <strong>Address:</strong> ${businessAddress}
                </p>
              ` : ''}

              <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
                📞 <strong>Contact:</strong> ${businessPhone}
              </p>

              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  ⏰ <strong>Please arrive 5-10 minutes early</strong>
                </p>
              </div>

              <div style="background-color: #fee2e2; border: 1px solid #ef4444; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                  ⚠️ <strong>Need to cancel?</strong> Please call us at ${businessPhone} as soon as possible.
                </p>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                We look forward to seeing you tomorrow!<br>
                ${businessName}
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">Powered by Salon Queue Management</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
