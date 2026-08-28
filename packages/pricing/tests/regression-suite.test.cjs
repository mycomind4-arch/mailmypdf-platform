const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  PRICES, LABELS, calculateQuote, getWorkflowPricingProfile,
  getProductionPricingProfiles, getPricingProfilesByVertical,
  serializeQuote, BAND_RANGES, isValidPricingKey,
} = require('../dist/index.js');

const ALL_PRODUCTION = getProductionPricingProfiles();
// Exclude mailmypdf core fulfillment products (they legitimately charge mailing-only)
const WORKFLOW_PROFILES = ALL_PRODUCTION.filter(p => p.verticalId !== 'mailmypdf');

describe('Universal Pricing Regression Suite', () => {

  describe('Price drift detection', () => {
    it('every production profile has basePriceCents within its band range', () => {
      for (const profile of ALL_PRODUCTION) {
        const range = BAND_RANGES[profile.band];
        assert.ok(profile.basePriceCents >= range.min && profile.basePriceCents <= range.max,
          `Band drift: ${profile.workflowId} (${profile.band}) basePriceCents=${profile.basePriceCents} range=[${range.min}, ${range.max}]`);
      }
    });

    it('FREE profiles have basePriceCents === 0', () => {
      for (const profile of ALL_PRODUCTION) {
        if (profile.band === 'FREE') assert.equal(profile.basePriceCents, 0, `FREE ${profile.workflowId} has non-zero basePriceCents`);
      }
    });

    it('no two production profiles share the same workflowId', () => {
      const seen = new Map();
      for (const profile of ALL_PRODUCTION) {
        const existing = seen.get(profile.workflowId);
        assert.ok(!existing, `Duplicate workflowId "${profile.workflowId}" in ${existing} and ${profile.verticalId}`);
        seen.set(profile.workflowId, profile.verticalId);
      }
    });
  });

  describe('Checkout drift detection', () => {
    it('calculateQuote is deterministic', () => {
      for (const profile of ALL_PRODUCTION.slice(0, 20)) {
        const input = { workflowId: profile.workflowId, verticalId: profile.verticalId, actualPages: 3, mailClass: 'standard' };
        assert.equal(calculateQuote(input).totalCents, calculateQuote(input).totalCents);
      }
    });

    it('quote total = base + extra pages + mail service (no hidden costs)', () => {
      for (const profile of ALL_PRODUCTION.slice(0, 20)) {
        const actualPages = profile.includedPages + 2;
        const quote = calculateQuote({ workflowId: profile.workflowId, verticalId: profile.verticalId, actualPages, mailClass: 'certified' });
        // The total should equal the subtotal (base + extraPage + supporting + mailService) minus discount
        const expectedSubtotal = quote.basePriceCents + quote.extraPageCost + quote.supportingPageCost + quote.mailServiceCost;
        assert.equal(quote.subtotalCents, expectedSubtotal, `Subtotal mismatch for ${profile.workflowId}: ${quote.subtotalCents} vs ${expectedSubtotal}`);
        assert.equal(quote.totalCents, expectedSubtotal - quote.discountCents, `Total mismatch for ${profile.workflowId}`);
      }
    });
  });

  describe('Mailing drift detection', () => {
    it('included-standard workflows do not charge standard mail twice', () => {
      for (const profile of ALL_PRODUCTION) {
        if (profile.includedMail !== 'standard') continue;
        const quote = calculateQuote({ workflowId: profile.workflowId, verticalId: profile.verticalId, actualPages: profile.includedPages, mailClass: 'standard' });
        assert.equal(quote.mailServiceCost, 0, `Mailing drift: ${profile.workflowId} charges mailServiceCost despite includedMail="standard"`);
        assert.equal(quote.mailUpgradeCost, 0, `Mailing drift: ${profile.workflowId} charges mailUpgradeCost for standard mail`);
      }
    });

    it('non-included mail charges the correct amount', () => {
      for (const profile of ALL_PRODUCTION) {
        if (profile.includedMail === 'standard' || profile.basePriceCents === 0) continue;
        const quote = calculateQuote({ workflowId: profile.workflowId, verticalId: profile.verticalId, actualPages: profile.includedPages, mailClass: 'standard' });
        assert.equal(quote.mailServiceCost, PRICES.standard, `Mailing drift: ${profile.workflowId} should charge ${PRICES.standard}, got ${quote.mailServiceCost}`);
      }
    });
  });

  describe('Legacy drift detection', () => {
    it('canonical PRICES match known mailing values', () => {
      assert.equal(PRICES.standard, 499);
      assert.equal(PRICES.certified, 1494);
      assert.equal(PRICES.registered, 3249);
    });

    it('no workflow-vertical profile charges ONLY the mailing price (legacy model)', () => {
      // mailmypdf core products legitimately charge mailing-only — exclude them
      for (const profile of WORKFLOW_PROFILES) {
        if (profile.band === 'FREE') continue;
        assert.notEqual(profile.basePriceCents, PRICES.standard, `Legacy: ${profile.workflowId} basePrice=standard mail`);
        assert.notEqual(profile.basePriceCents, PRICES.certified, `Legacy: ${profile.workflowId} basePrice=certified mail`);
        assert.notEqual(profile.basePriceCents, PRICES.registered, `Legacy: ${profile.workflowId} basePrice=registered mail`);
      }
    });
  });

  describe('Commercial-status drift detection', () => {
    it('disabled workflows throw when quoting', () => {
      assert.throws(() => calculateQuote({ workflowId: 'govreply', verticalId: 'gov-reply', actualPages: 1 }), /not available for purchase/i);
    });

    it('FREE workflow quotes 0 and with mail charges only mail', () => {
      assert.equal(calculateQuote({ workflowId: 'biometrics', verticalId: 'immigration-mail', actualPages: 1 }).totalCents, 0);
      const q = calculateQuote({ workflowId: 'biometrics', verticalId: 'immigration-mail', actualPages: 1, mailClass: 'certified' });
      assert.equal(q.basePriceCents, 0);
      assert.equal(q.totalCents, PRICES.certified);
    });
  });

  describe('Currency drift detection', () => {
    it('all profiles use usd', () => {
      for (const p of ALL_PRODUCTION) assert.equal(p.currency, 'usd');
    });

    it('all quote totals are positive integers', () => {
      for (const p of ALL_PRODUCTION.slice(0, 20)) {
        const q = calculateQuote({ workflowId: p.workflowId, verticalId: p.verticalId, actualPages: 3, mailClass: 'certified' });
        assert.ok(Number.isInteger(q.totalCents), `Currency drift: ${p.workflowId} not integer`);
        assert.ok(q.totalCents >= 0, `Currency drift: ${p.workflowId} negative`);
      }
    });
  });

  describe('Rounding drift detection', () => {
    it('quote total equals subtotal minus discount (no rounding errors)', () => {
      for (const p of ALL_PRODUCTION.slice(0, 30)) {
        const q = calculateQuote({ workflowId: p.workflowId, verticalId: p.verticalId, actualPages: p.includedPages + 3, supportingPages: 2, mailClass: 'certified' });
        assert.equal(q.totalCents, q.subtotalCents - q.discountCents, `Rounding drift: ${p.workflowId} total=${q.totalCents} subtotal-discount=${q.subtotalCents - q.discountCents}`);
      }
    });

    it('subtotal equals sum of all components', () => {
      for (const p of ALL_PRODUCTION.slice(0, 30)) {
        const q = calculateQuote({ workflowId: p.workflowId, verticalId: p.verticalId, actualPages: p.includedPages + 3, supportingPages: 2, mailClass: 'certified' });
        const sum = q.basePriceCents + q.extraPageCost + q.supportingPageCost + q.mailServiceCost;
        assert.equal(q.subtotalCents, sum, `Subtotal drift: ${p.workflowId} subtotal=${q.subtotalCents} sum=${sum}`);
      }
    });
  });

  describe('Cross-vertical consistency', () => {
    it('mailing surcharges are consistent', () => {
      for (const p of ALL_PRODUCTION) {
        assert.equal(p.certifiedMailSurchargeCents, PRICES.certified - PRICES.standard, `Mail drift: ${p.workflowId} certified surcharge`);
        assert.equal(p.registeredMailSurchargeCents, PRICES.registered - PRICES.standard, `Mail drift: ${p.workflowId} registered surcharge`);
      }
    });
  });

  describe('Quote snapshot immutability', () => {
    it('serialized quote matches original', () => {
      const q = calculateQuote({ workflowId: 'cp2000-response', verticalId: 'notice-respond', actualPages: 5, mailClass: 'certified' });
      const s = serializeQuote(q);
      assert.ok(s.length > 0);
      const p = JSON.parse(s);
      assert.equal(p.totalCents, q.totalCents);
      assert.equal(p.workflowId, q.workflowId);
      assert.equal(p.band, q.band);
    });
  });

  describe('Ecosystem coverage', () => {
    it('has at least 170 production profiles', () => {
      assert.ok(ALL_PRODUCTION.length >= 170, `Expected >= 170, got ${ALL_PRODUCTION.length}`);
    });

    it('covers all major verticals', () => {
      const required = ['mailmypdf', 'notice-respond', 'dispute-mail', 'appeal-mail', 'immigration-mail', 'insurance-claims', 'benefits-appeal', 'records-requests', 'code-enforcement', 'mailmypdf-private-office', 'mailmypdf-smallbusiness'];
      for (const v of required) {
        const count = getPricingProfilesByVertical(v).filter(p => p.commercialStatus === 'production').length;
        assert.ok(count > 0, `Vertical ${v} has no production profiles`);
      }
    });
  });
});
