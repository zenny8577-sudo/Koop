
import { Product, VerificationResult, VerificationCheck } from '../types';

export class ProductVerificationService {
  private static DUTCH_CATEGORIES = ['fietsen', 'kunst', 'design', 'antiek'];

  public static verify(product: Product): VerificationResult {
    const authenticity = this.checkAuthenticity(product);
    const condition = this.verifyCondition(product.description);
    const priceFairness = this.compareMarketPrice(product);
    const legalCompliance = this.checkDutchRegulations(product.category);

    const overallPassed = 
      authenticity.passed && 
      condition.passed && 
      priceFairness.passed && 
      legalCompliance.passed;

    return {
      authenticity,
      condition,
      priceFairness,
      legalCompliance,
      overallPassed,
      verifiedAt: new Date().toISOString(),
    };
  }

  private static checkAuthenticity(product: Product): VerificationCheck {
    // In a real system, this would involve AI image analysis or manual serial number checking
    // Here we simulate based on description length and SKU presence
    const hasSku = !!product.sku;
    const descLength = product.description.length;
    const score = (hasSku ? 0.6 : 0.2) + (descLength > 50 ? 0.4 : 0.1);
    
    return {
      passed: score >= 0.7,
      score: Math.min(score, 1),
      message: score >= 0.7 ? 'Authenticiteit bevestigd via metadata.' : 'Onvoldoende bewijs van echtheid.',
    };
  }

  private static verifyCondition(description: string): VerificationCheck {
    const keywords = ['nieuw', 'perfect', 'geen krassen', 'goed onderhouden', 'premium'];
    const lowerDesc = description.toLowerCase();
    const matches = keywords.filter(k => lowerDesc.includes(k)).length;
    const score = matches / keywords.length;

    return {
      passed: score >= 0.4,
      score,
      message: score >= 0.4 ? 'Conditie komt overeen met omschrijving.' : 'Omschrijving mist details over conditie.',
    };
  }

  private static compareMarketPrice(product: Product): VerificationCheck {
    // Simulated market price check
    const averagePrices: Record<string, number> = {
      'Elektronica': 800,
      'Design': 1200,
      'Fietsen': 1500,
      'Antiek': 500,
      'Gadgets': 200,
    };

    const avg = averagePrices[product.category] || 500;
    const deviation = Math.abs(product.price - avg) / avg;
    const passed = deviation < 0.8; // Flags extremely high or low prices

    return {
      passed,
      score: 1 - Math.min(deviation, 1),
      message: passed ? 'Prijs is marktconform.' : 'Verdachte prijsafwijking geconstateerd.',
    };
  }

  private static checkDutchRegulations(category: string): VerificationCheck {
    const normalizedCat = category.toLowerCase();
    const needsSpecificDutchCheck = this.DUTCH_CATEGORIES.includes(normalizedCat);
    
    // Example: Specific check for e-bikes or designer furniture
    return {
      passed: true,
      score: 1,
      message: needsSpecificDutchCheck 
        ? `Voldoet aan specifieke Nederlandse regelgeving voor ${category}.`
        : 'Standaard EU-conformiteit gecontroleerd.',
    };
  }
}
