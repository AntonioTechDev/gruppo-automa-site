/* Site settings you can change without touching the rest of the code.

   bookingUrl: link to your Google Calendar booking page (appointment schedule).
   How to get it: Google Calendar → Create → Appointment schedule → set duration and availability →
   Save → "Share" → copy the booking page link. Paste it here, between the quotes.
   Empty = the "Prenota" buttons fall back to the contact form.

   prices: starting prices ("da / from"), tax excluded.
   aud = shown on the English site (Australia), eur = shown on the Italian site.
   Change a number here and every price on the page updates. */
window.ANTIPODE_CONFIG = {
  // full link (the calendar.app.google short link can't be embedded)
  bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2yfcX27sBuf1SBlc29hi0hMSuHtQXm-3-LU9d-4w9ukuuho0QG8kNSTi71ikq7yQqfF9pBjBBa",

  prices: {
    aud: { landing: 1290, site: 2790, shop: 4990, auto: 1190, agent: 4490, saas: 5000, care: 99, support: 290, hour: 110 },
    eur: { landing: 790, site: 1690, shop: 2990, auto: 690, agent: 2690, saas: 2990, care: 59, support: 169, hour: 65 },
  },
};
