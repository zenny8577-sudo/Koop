import { Product, VerificationResult, VerificationCheck } from '../types';

export class ProductVerificationService {
  private static DUTCH_CATEGORIES = ['fietsen', 'kunst', 'design', 'antiek'];

  public static async verify(product: Product): Promise<VerificationResult> {
    try {
      // Call AI verification API
      const response = await fetch('/api/verify-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.image
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();
      return {
        ...result,
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Verification error:', error);
      // Fallback to basic verification
      return this.basicVerification(product);
    }
  }

  private static basicVerification(product: Product): VerificationResult {
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

  // ... (manter os métodos privados existentes)
}